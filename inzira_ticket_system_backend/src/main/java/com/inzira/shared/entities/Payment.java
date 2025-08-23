package com.inzira.shared.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "payments")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String paymentMethod; // STRIPE, CASH

    @Column(nullable = false)
    private String status; // PENDING, SUCCESS, FAILED, REFUNDED, CANCELLED

    @Column(unique = true)
    private String transactionReference;

    @Column(length = 1000)
    private String paymentUrl; // For redirect-based payments

    @Column(length = 1000)
    private String callbackData; // Store payment provider response

    @Column(length = 100)
    private String currency; // RWF, USD, etc.

    @Column(length = 500)
    private String description; // Payment description

    @Column(length = 100)
    private String email; // Customer email

    @Column(length = 100)
    private String customerName; // Customer name

    @Column(length = 100)
    private String paymentProvider; // STRIPE, CASH

    @Column(length = 1000)
    private String failureReason; // Reason for payment failure

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Payment() {}
}