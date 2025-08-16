package com.inzira.shared.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PaymentResponse {
    
    private Long paymentId;
    private String transactionReference;
    private String status;
    private String message;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String paymentUrl; // For redirect-based payments
    private LocalDateTime createdAt;
    private String qrCode; // For mobile money payments
    private String instructions; // Payment instructions
    private boolean requiresRedirect;
    private String redirectUrl;
    
    // Success response
    public static PaymentResponse success(Long paymentId, String transactionReference, 
                                       BigDecimal amount, String currency, String paymentMethod) {
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(paymentId);
        response.setTransactionReference(transactionReference);
        response.setStatus("SUCCESS");
        response.setMessage("Payment initiated successfully");
        response.setAmount(amount);
        response.setCurrency(currency);
        response.setPaymentMethod(paymentMethod);
        response.setCreatedAt(LocalDateTime.now());
        return response;
    }
    
    // Redirect response
    public static PaymentResponse redirect(String transactionReference, String redirectUrl, 
                                        BigDecimal amount, String currency, String paymentMethod) {
        PaymentResponse response = new PaymentResponse();
        response.setTransactionReference(transactionReference);
        response.setStatus("PENDING");
        response.setMessage("Redirect to payment page");
        response.setAmount(amount);
        response.setCurrency(currency);
        response.setPaymentMethod(paymentMethod);
        response.setRequiresRedirect(true);
        response.setRedirectUrl(redirectUrl);
        response.setCreatedAt(LocalDateTime.now());
        return response;
    }
    
    // Error response
    public static PaymentResponse error(String message) {
        PaymentResponse response = new PaymentResponse();
        response.setStatus("ERROR");
        response.setMessage(message);
        response.setCreatedAt(LocalDateTime.now());
        return response;
    }
}
