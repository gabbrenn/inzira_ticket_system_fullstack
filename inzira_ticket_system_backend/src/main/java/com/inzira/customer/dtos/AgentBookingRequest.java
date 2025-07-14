package com.inzira.customer.dtos;

import lombok.Data;

@Data
public class AgentBookingRequest {
    private Long agentId;
    private Long scheduleId;
    private Long pickupPointId;
    private Long dropPointId;
    private Integer numberOfSeats;
    
    // Customer details for walk-in customers
    private String customerFirstName;
    private String customerLastName;
    private String customerEmail;
    private String customerPhoneNumber;
}