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

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${stripe.success.url:}")
    private String configuredSuccessUrl;

    @Value("${stripe.cancel.url:}")
    private String configuredCancelUrl;

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

            // Derive booking/ticket details for meaningful display on Stripe
            var booking = payment.getBooking();
            String origin = booking.getSchedule().getAgencyRoute().getRoute().getOrigin().getName();
            String destination = booking.getSchedule().getAgencyRoute().getRoute().getDestination().getName();
            String routeName = origin + " → " + destination;
            String travelDate = String.valueOf(booking.getSchedule().getDepartureDate());
            String travelTime = String.valueOf(booking.getSchedule().getDepartureTime());
            String pickup = booking.getPickupPoint() != null ? booking.getPickupPoint().getName() : "-";
            String drop = booking.getDropPoint() != null ? booking.getDropPoint().getName() : "-";
            int seats = booking.getNumberOfSeats() != null ? booking.getNumberOfSeats() : 1;

            String customerEmail = request.getEmail() != null && !request.getEmail().isBlank()
                ? request.getEmail()
                : (booking.getCustomer() != null ? booking.getCustomer().getEmail() : null);

            // Stripe expects amounts in the smallest currency unit
            boolean zeroDecimal = isZeroDecimalCurrency(request.getCurrency());
            long amountInSmallestUnit = zeroDecimal
                ? request.getAmount().setScale(0, java.math.RoundingMode.HALF_UP).longValue()
                : request.getAmount().multiply(new BigDecimal(100)).setScale(0, java.math.RoundingMode.HALF_UP).longValue();

            // Use per-seat pricing when divisible, otherwise charge as a single line
            long quantity = Math.max(1, seats);
            long unitAmount = amountInSmallestUnit;
            if (quantity > 1 && amountInSmallestUnit % quantity == 0) {
                unitAmount = amountInSmallestUnit / quantity;
            } else {
                quantity = 1;
            }

            // Professional success/cancel URLs
            String successUrl = (configuredSuccessUrl != null && !configuredSuccessUrl.isBlank())
                ? configuredSuccessUrl
                : frontendBaseUrl + "/payment/success?session_id={CHECKOUT_SESSION_ID}&ref=" + payment.getTransactionReference();
            String cancelUrl = (configuredCancelUrl != null && !configuredCancelUrl.isBlank())
                ? configuredCancelUrl
                : frontendBaseUrl + "/payment/cancel?ref=" + payment.getTransactionReference();

            String lineItemName = "Bus Ticket: " + routeName;
            String lineItemDescription = "Travel " + travelDate + " " + travelTime
                + " • Seats: " + seats
                + " • Pickup: " + pickup
                + " • Drop: " + drop
                + " • Ref: " + booking.getBookingReference();

            SessionCreateParams.Builder builder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .setClientReferenceId(payment.getTransactionReference());

            if (customerEmail != null && !customerEmail.isBlank()) {
                builder.setCustomerEmail(customerEmail);
            }

            SessionCreateParams.PaymentIntentData.Builder piBuilder = SessionCreateParams.PaymentIntentData.builder()
                .setDescription((request.getDescription() != null && !request.getDescription().isBlank())
                    ? request.getDescription()
                    : ("Ticket " + routeName + " on " + travelDate))
                .putMetadata("payment_reference", payment.getTransactionReference())
                .putMetadata("booking_id", String.valueOf(booking.getId()))
                .putMetadata("booking_reference", booking.getBookingReference())
                .putMetadata("route", routeName)
                .putMetadata("travel_date", travelDate)
                .putMetadata("travel_time", travelTime)
                .putMetadata("seats", String.valueOf(seats))
                .putMetadata("pickup", pickup)
                .putMetadata("drop", drop)
                .putMetadata("currency", request.getCurrency());

            if (customerEmail != null && !customerEmail.isBlank()) {
                piBuilder.setReceiptEmail(customerEmail);
            }

            builder.setPaymentIntentData(piBuilder.build());

            builder.addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setQuantity(quantity)
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency(request.getCurrency().toLowerCase())
                            .setUnitAmount(unitAmount)
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(lineItemName)
                                    .setDescription(lineItemDescription)
                                    .build())
                            .build())
                    .build());

            SessionCreateParams params = builder.build();

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
            response.setInstructions("Complete your ticket payment securely on Stripe. You'll be redirected back after payment.");

            return response;

        } catch (StripeException e) {
            log.error("Error creating Stripe Checkout Session: {}", e.getMessage(), e);
            return PaymentResponse.error("Stripe payment failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating Stripe session: {}", e.getMessage(), e);
            return PaymentResponse.error("Stripe payment failed");
        }
    }

    private boolean isZeroDecimalCurrency(String currency) {
        if (currency == null) return false;
        switch (currency.toUpperCase()) {
            case "BIF":
            case "CLP":
            case "DJF":
            case "GNF":
            case "JPY":
            case "KMF":
            case "KRW":
            case "MGA":
            case "PYG":
            case "RWF":
            case "UGX":
            case "VND":
            case "VUV":
            case "XAF":
            case "XOF":
            case "XPF":
                return true;
            default:
                return false;
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
