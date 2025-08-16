package com.inzira.shared.dtos;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PaymentRequest {
    
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotBlank(message = "Payment method is required")
    @Pattern(regexp = "^(MOBILE_MONEY|BANK_CARD|CASH|STRIPE|BANK_TRANSFER)$", 
             message = "Invalid payment method")
    private String paymentMethod;
    
    @NotBlank(message = "Currency is required")
    @Pattern(regexp = "^(RWF|USD|EUR)$", message = "Invalid currency")
    private String currency;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    // For mobile money payments
    @Pattern(regexp = "^07[0-9]{8}$", message = "Invalid phone number format")
    private String phoneNumber;
    
    // For card payments
    private String email;
    
    private String customerName;
    
    // Additional metadata
    private String metadata;
}
