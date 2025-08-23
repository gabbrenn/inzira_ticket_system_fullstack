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
    @Pattern(regexp = "^(STRIPE|CASH)$", 
             message = "Invalid payment method. Only STRIPE and CASH are supported")
    private String paymentMethod;
    
    @NotBlank(message = "Currency is required")
    @Pattern(regexp = "^(RWF|USD|EUR)$", message = "Invalid currency")
    private String currency;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    // For card payments
    private String email;
    
    private String customerName;
    
    // Additional metadata
    private String metadata;
}
