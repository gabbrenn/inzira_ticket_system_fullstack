package com.inzira.shared.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.Data;

@Entity
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
    private String paymentMethod; // MOBILE_MONEY, BANK_CARD, CASH

    @Column(nullable = false)
    private String status; // PENDING, SUCCESS, FAILED, REFUNDED

    @Column(unique = true)
    private String transactionReference;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public Payment() {}
}