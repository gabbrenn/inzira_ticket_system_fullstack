package com.inzira.driver.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.inzira.shared.entities.Booking;

import lombok.Data;

@Data
public class TicketVerificationResponse {
    private boolean valid;
    private String message;
    private String status; // VALID, ALREADY_USED, INVALID_SCHEDULE, INVALID_AGENCY, NOT_FOUND
    
    // Booking details (if valid)
    private String bookingReference;
    private String customerName;
    private String customerPhone;
    private Integer numberOfSeats;
    private BigDecimal totalAmount;
    private String pickupPointName;
    private String dropPointName;
    private String routeInfo;
    private LocalDateTime verifiedAt;
    private boolean alreadyUsed;
    private List<Booking> bookings;
    
    // Schedule validation info
    private String scheduleInfo;
    private String agencyName;
    public void setBookings(List<Booking> bookings){
        this.bookings = bookings;
    }
    public TicketVerificationResponse(boolean valid, String message, String status) {
        this.valid = valid;
        this.message = message;
        this.status = status;
    }

    
    public TicketVerificationResponse() {}
}