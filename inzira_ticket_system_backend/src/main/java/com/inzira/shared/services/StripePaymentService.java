package com.inzira.shared.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.inzira.shared.dtos.PaymentRequest;
import com.inzira.shared.dtos.PaymentResponse;
import com.inzira.shared.entities.Payment;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StripePaymentService {

    @Value("${stripe.secret.key:}")
    private String secretKey;

    @Value("${stripe.publishable.key:}")
    private String publishableKey;

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    /**
     * Process Stripe payment by creating a Checkout Session
     */
    public PaymentResponse processPayment(PaymentRequest request, Payment payment) {
        try {
            log.info("Creating Stripe Checkout Session for reference: {}", payment.getTransactionReference());

            // Stripe expects amounts in the smallest currency unit
            // RWF has no decimals, so we pass the raw value (no *100)
            long amountInSmallestUnit = request.getAmount().longValue();

            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("https://yourdomain.com/cancel")
                .setClientReferenceId(payment.getTransactionReference())
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(request.getCurrency().toLowerCase()) // e.g. rwf, usd
                                .setUnitAmount(amountInSmallestUnit)
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Payment for Order " + payment.getTransactionReference())
                                        .build())
                                .build())
                        .build())
                .build();

            Session session = Session.create(params);

            // Update payment with Stripe Checkout URL
            payment.setPaymentUrl(session.getUrl());
            payment.setUpdatedAt(LocalDateTime.now());

            PaymentResponse response = new PaymentResponse();
            response.setTransactionReference(payment.getTransactionReference());
            response.setStatus("PENDING");
            response.setMessage("Stripe Checkout session created");
            response.setAmount(request.getAmount());
            response.setCurrency(request.getCurrency());
            response.setPaymentMethod(request.getPaymentMethod());
            response.setPaymentUrl(session.getUrl());
            response.setRequiresRedirect(true);
            response.setRedirectUrl(session.getUrl());
            response.setCreatedAt(LocalDateTime.now());
            response.setInstructions("You will be redirected to Stripe to complete your payment securely.");

            return response;

        } catch (StripeException e) {
            log.error("Error creating Stripe Checkout Session: {}", e.getMessage(), e);
            return PaymentResponse.error("Stripe payment failed: " + e.getMessage());
        }
    }

    /**
     * Handle Stripe webhook callback
     * (checkout.session.completed event)
     */
    public boolean processCallback(Payment payment, String callbackData) {
        // TODO: Implement webhook verification using webhookSecret
        // Use com.stripe.net.Webhook.constructEvent(payload, sigHeader, webhookSecret)
        log.warn("Stripe callback handling not yet implemented");
        return false;
    }

    /**
     * Process Stripe refund
     */
    public boolean processRefund(Payment payment, BigDecimal amount) {
        try {
            log.info("Processing Stripe refund for reference: {}", payment.getTransactionReference());
            // TODO: Implement Refund.create(params) with Stripe API
            return true;
        } catch (Exception e) {
            log.error("Error processing Stripe refund: {}", e.getMessage(), e);
            return false;
        }
    }

    public boolean isConfigured() {
        return secretKey != null && !secretKey.trim().isEmpty()
            && publishableKey != null && !publishableKey.trim().isEmpty();
    }
}
