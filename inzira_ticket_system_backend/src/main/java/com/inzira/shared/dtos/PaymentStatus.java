package com.inzira.shared.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PaymentStatus {
    
    private String transactionReference;
    private String status;
    private String message;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String failureReason;
    private boolean isCompleted;
    private boolean isSuccessful;
    
    // Status constants
    public static final String PENDING = "PENDING";
    public static final String SUCCESS = "SUCCESS";
    public static final String FAILED = "FAILED";
    public static final String REFUNDED = "REFUNDED";
    public static final String CANCELLED = "CANCELLED";
    
    // Helper methods
    public boolean isPending() {
        return PENDING.equals(status);
    }
    
    public boolean isSuccess() {
        return SUCCESS.equals(status);
    }
    
    public boolean isFailed() {
        return FAILED.equals(status);
    }
    
    public boolean isRefunded() {
        return REFUNDED.equals(status);
    }
    
    public boolean isCancelled() {
        return CANCELLED.equals(status);
    }
}
