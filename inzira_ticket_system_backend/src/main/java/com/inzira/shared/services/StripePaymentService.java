package com.inzira.shared.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.inzira.shared.dtos.PaymentRequest;
import com.inzira.shared.dtos.PaymentResponse;
import com.inzira.shared.entities.Payment;

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

    /**
     * Process Stripe payment
     */
    public PaymentResponse processPayment(PaymentRequest request, Payment payment) {
        try {
            log.info("Processing Stripe payment for reference: {}", payment.getTransactionReference());
            
            // Validate email for card payments
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return PaymentResponse.error("Email is required for card payment");
            }
            
            // For now, simulate Stripe payment initiation
            // In production, you would integrate with actual Stripe API
            PaymentResponse response = simulateStripePayment(request, payment);
            
            // Update payment with Stripe-specific data
            payment.setPaymentUrl(response.getPaymentUrl());
            payment.setUpdatedAt(LocalDateTime.now());
            
            log.info("Stripe payment initiated successfully for reference: {}", payment.getTransactionReference());
            return response;
            
        } catch (Exception e) {
            log.error("Error processing Stripe payment: {}", e.getMessage(), e);
            return PaymentResponse.error("Stripe payment failed: " + e.getMessage());
        }
    }

    /**
     * Process Stripe callback
     */
    public boolean processCallback(Payment payment, String callbackData) {
        try {
            log.info("Processing Stripe callback for reference: {}", payment.getTransactionReference());
            
            // Parse callback data (this would be actual Stripe webhook data)
            Map<String, Object> callback = parseCallbackData(callbackData);
            
            // Check if payment was successful
            String status = (String) callback.get("status");
            if ("succeeded".equals(status)) {
                log.info("Stripe payment successful for reference: {}", payment.getTransactionReference());
                return true;
            } else {
                log.warn("Stripe payment failed for reference: {}. Status: {}", 
                        payment.getTransactionReference(), status);
                payment.setStatus("FAILED");
                payment.setFailureReason("Stripe payment failed: " + status);
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error processing Stripe callback: {}", e.getMessage(), e);
            payment.setStatus("FAILED");
            payment.setFailureReason("Callback processing error: " + e.getMessage());
            return false;
        }
    }

    /**
     * Process Stripe refund
     */
    public boolean processRefund(Payment payment, BigDecimal amount) {
        try {
            log.info("Processing Stripe refund for reference: {}", payment.getTransactionReference());
            
            // In production, you would call Stripe refund API
            // For now, simulate successful refund
            log.info("Stripe refund processed successfully for reference: {}", payment.getTransactionReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error processing Stripe refund: {}", e.getMessage(), e);
            return false;
        }
    }

    // Helper methods
    private PaymentResponse simulateStripePayment(PaymentRequest request, Payment payment) {
        // This is a simulation - in production, you would call actual Stripe API
        
        // Generate Stripe payment URL (this would come from Stripe API)
        String stripePaymentUrl = generateStripePaymentUrl(request, payment);
        
        // Create response
        PaymentResponse response = new PaymentResponse();
        response.setTransactionReference(payment.getTransactionReference());
        response.setStatus("PENDING");
        response.setMessage("Stripe payment initiated. Please complete payment on the next page.");
        response.setAmount(request.getAmount());
        response.setCurrency(request.getCurrency());
        response.setPaymentMethod(request.getPaymentMethod());
        response.setPaymentUrl(stripePaymentUrl);
        response.setRequiresRedirect(true);
        response.setRedirectUrl(stripePaymentUrl);
        response.setCreatedAt(LocalDateTime.now());
        
        // Add Stripe-specific instructions
        response.setInstructions("1. You will be redirected to Stripe's secure payment page\n" +
                               "2. Enter your card details and complete payment\n" +
                               "3. You will be redirected back after payment completion");
        
        return response;
    }
    
    private String generateStripePaymentUrl(PaymentRequest request, Payment payment) {
        // In production, this would be generated by Stripe API
        // For now, return a placeholder URL
        return String.format("https://checkout.stripe.com/pay?client_reference_id=%s&amount=%s&currency=%s", 
                           payment.getTransactionReference(),
                           request.getAmount().multiply(BigDecimal.valueOf(100)).longValue(), // Convert to cents
                           request.getCurrency().toLowerCase());
    }
    
    private Map<String, Object> parseCallbackData(String callbackData) {
        // In production, this would parse actual Stripe webhook data
        // For now, return simulated data
        Map<String, Object> callback = new HashMap<>();
        callback.put("status", "succeeded");
        callback.put("payment_intent_id", "pi_" + System.currentTimeMillis());
        callback.put("amount", "1000");
        callback.put("currency", "rwf");
        callback.put("email", "customer@example.com");
        return callback;
    }
    
    /**
     * Check if Stripe is properly configured
     */
    public boolean isConfigured() {
        return secretKey != null && !secretKey.trim().isEmpty() &&
               publishableKey != null && !publishableKey.trim().isEmpty();
    }
}
