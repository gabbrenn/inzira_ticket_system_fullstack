package com.inzira.driver.dtos;

import lombok.Data;

@Data
public class TicketVerificationRequest {
    private Long driverId;
    private String bookingReference;
    private String qrData;
}