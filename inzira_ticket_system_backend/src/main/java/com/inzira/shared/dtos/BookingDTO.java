package com.inzira.shared.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class BookingDTO {
    private Long id;
    private String bookingReference;
    private String customerName;
    private String customerEmail;
    private ScheduleDTO schedule;
    private String pickupPointName;
    private String dropPointName;
    private Integer numberOfSeats;
    private BigDecimal totalAmount;
    private String status;
    private String paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}