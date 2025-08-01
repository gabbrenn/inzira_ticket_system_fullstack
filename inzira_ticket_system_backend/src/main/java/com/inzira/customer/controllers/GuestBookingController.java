package com.inzira.customer.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.customer.dtos.AgentBookingRequest;
import com.inzira.customer.services.GuestBookingService;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/guest")
public class GuestBookingController {

    @Autowired
    private GuestBookingService guestBookingService;

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<Booking>> createGuestBooking(@RequestBody AgentBookingRequest request) {
        Booking createdBooking = guestBookingService.createGuestBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Guest booking created successfully", createdBooking));
    }
}