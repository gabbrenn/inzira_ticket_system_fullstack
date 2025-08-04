package com.inzira.driver.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.driver.dtos.TicketVerificationRequest;
import com.inzira.driver.dtos.TicketVerificationResponse;
import com.inzira.driver.services.TicketVerificationService;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/driver/verification")
public class TicketVerificationController {

    @Autowired
    private TicketVerificationService ticketVerificationService;

    @PostMapping("/reference")
    public ResponseEntity<ApiResponse<TicketVerificationResponse>> verifyByReference(
            @RequestBody TicketVerificationRequest request) {
        
        TicketVerificationResponse response = ticketVerificationService.verifyTicketByReference(
            request.getDriverId(), 
            request.getBookingReference()
        );
        
        return ResponseEntity.ok(new ApiResponse<>(true, response.getMessage(), response));
    }

    @PostMapping("/qr-code")
    public ResponseEntity<ApiResponse<TicketVerificationResponse>> verifyByQRCode(
            @RequestBody TicketVerificationRequest request) {
        
        TicketVerificationResponse response = ticketVerificationService.verifyTicketByQRCode(
            request.getDriverId(), 
            request.getQrData()
        );
        
        return ResponseEntity.ok(new ApiResponse<>(true, response.getMessage(), response));
    }

    @GetMapping("/schedule/{scheduleId}/bookings")
    public ResponseEntity<ApiResponse<TicketVerificationResponse>> getScheduleBookings(
            @PathVariable Long scheduleId,
            @RequestParam Long driverId) {
        
        TicketVerificationResponse response = ticketVerificationService.getScheduleBookingsForDriver(driverId, scheduleId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Schedule bookings retrieved", response));
    }
}