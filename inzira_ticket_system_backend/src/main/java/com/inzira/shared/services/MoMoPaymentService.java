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
public class MoMoPaymentService {

    @Value("${momo.api.key:}")
    private String apiKey;
    
    @Value("${momo.api.secret:}")
    private String apiSecret;
    
    @Value("${momo.merchant.id:}")
    private String merchantId;
    
    @Value("${momo.callback.url:}")
    private String callbackUrl;
    
    @Value("${momo.api.url:https://sandbox.momodeveloper.mtn.com}")
    private String apiUrl;

    /**
     * Process MoMo payment
     */
    public PaymentResponse processPayment(PaymentRequest request, Payment payment) {
        try {
            log.info("Processing MoMo payment for reference: {}", payment.getTransactionReference());
            
            // Validate phone number
            if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
                return PaymentResponse.error("Phone number is required for mobile money payment");
            }
            
            // For now, simulate MoMo payment initiation
            // In production, you would integrate with actual MoMo API
            PaymentResponse response = simulateMoMoPayment(request, payment);
            
            // Update payment with MoMo-specific data
            payment.setPaymentUrl(response.getPaymentUrl());
            payment.setUpdatedAt(LocalDateTime.now());
            
            log.info("MoMo payment initiated successfully for reference: {}", payment.getTransactionReference());
            return response;
            
        } catch (Exception e) {
            log.error("Error processing MoMo payment: {}", e.getMessage(), e);
            return PaymentResponse.error("MoMo payment failed: " + e.getMessage());
        }
    }

    /**
     * Process MoMo callback
     */
    public boolean processCallback(Payment payment, String callbackData) {
        try {
            log.info("Processing MoMo callback for reference: {}", payment.getTransactionReference());
            
            // Parse callback data (this would be actual MoMo callback data)
            Map<String, Object> callback = parseCallbackData(callbackData);
            
            // Check if payment was successful
            String status = (String) callback.get("status");
            if ("SUCCESSFUL".equals(status)) {
                log.info("MoMo payment successful for reference: {}", payment.getTransactionReference());
                return true;
            } else {
                log.warn("MoMo payment failed for reference: {}. Status: {}", 
                        payment.getTransactionReference(), status);
                payment.setStatus("FAILED");
                payment.setFailureReason("MoMo payment failed: " + status);
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error processing MoMo callback: {}", e.getMessage(), e);
            payment.setStatus("FAILED");
            payment.setFailureReason("Callback processing error: " + e.getMessage());
            return false;
        }
    }

    /**
     * Process MoMo refund
     */
    public boolean processRefund(Payment payment, BigDecimal amount) {
        try {
            log.info("Processing MoMo refund for reference: {}", payment.getTransactionReference());
            
            // In production, you would call MoMo refund API
            // For now, simulate successful refund
            log.info("MoMo refund processed successfully for reference: {}", payment.getTransactionReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error processing MoMo refund: {}", e.getMessage(), e);
            return false;
        }
    }

    // Helper methods
    private PaymentResponse simulateMoMoPayment(PaymentRequest request, Payment payment) {
        // This is a simulation - in production, you would call actual MoMo API
        
        // Generate MoMo payment URL (this would come from MoMo API)
        String momoPaymentUrl = generateMoMoPaymentUrl(request, payment);
        
        // Create response
        PaymentResponse response = new PaymentResponse();
        response.setTransactionReference(payment.getTransactionReference());
        response.setStatus("PENDING");
        response.setMessage("MoMo payment initiated. Please complete payment on your phone.");
        response.setAmount(request.getAmount());
        response.setCurrency(request.getCurrency());
        response.setPaymentMethod(request.getPaymentMethod());
        response.setPaymentUrl(momoPaymentUrl);
        response.setRequiresRedirect(true);
        response.setRedirectUrl(momoPaymentUrl);
        response.setCreatedAt(LocalDateTime.now());
        
        // Add MoMo-specific instructions
        response.setInstructions("1. You will receive a prompt on your phone\n" +
                               "2. Enter your MoMo PIN to confirm payment\n" +
                               "3. Wait for confirmation SMS");
        
        return response;
    }
    
    private String generateMoMoPaymentUrl(PaymentRequest request, Payment payment) {
        // In production, this would be generated by MoMo API
        // For now, return a placeholder URL
        return String.format("%s/payment?ref=%s&amount=%s&phone=%s", 
                           apiUrl, 
                           payment.getTransactionReference(),
                           request.getAmount(),
                           request.getPhoneNumber());
    }
    
    private Map<String, Object> parseCallbackData(String callbackData) {
        // In production, this would parse actual MoMo callback data
        // For now, return simulated data
        Map<String, Object> callback = new HashMap<>();
        callback.put("status", "SUCCESSFUL");
        callback.put("transactionId", "MOMO-" + System.currentTimeMillis());
        callback.put("amount", "1000");
        callback.put("currency", "RWF");
        callback.put("phoneNumber", "0781234567");
        return callback;
    }
    
    /**
     * Check if MoMo is properly configured
     */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty() &&
               apiSecret != null && !apiSecret.trim().isEmpty() &&
               merchantId != null && !merchantId.trim().isEmpty();
    }
}
