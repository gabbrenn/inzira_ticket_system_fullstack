package com.inzira.shared.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookingReference;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "schedule_id")
    private Schedule schedule;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pickup_point_id")
    private RoutePoint pickupPoint;

    @ManyToOne(optional = false)
    @JoinColumn(name = "drop_point_id")
    private RoutePoint dropPoint;

    @Column(nullable = false)
    private Integer numberOfSeats;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private String status; // PENDING, CONFIRMED, CANCELLED, COMPLETED

    @Column(nullable = false)
    private String paymentStatus; // PENDING, PAID, REFUNDED

    // QR Code for ticket verification
    @Column(length = 1000)
    private String qrCode;

    // Ticket download URL
    @Column(length = 500)
    private String ticketPdfPath;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Booking() {}
}