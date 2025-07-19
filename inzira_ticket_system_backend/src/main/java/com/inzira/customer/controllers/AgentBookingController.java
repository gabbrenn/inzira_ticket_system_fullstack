package com.inzira.customer.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.customer.dtos.AgentBookingRequest;
import com.inzira.customer.services.AgentBookingService;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/agent")
public class AgentBookingController {

    @Autowired
    private AgentBookingService agentBookingService;

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<Booking>> createBookingForCustomer(@RequestBody AgentBookingRequest request) {
        Booking createdBooking = agentBookingService.createBookingForCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Booking created successfully for customer", createdBooking));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<Booking>>> getAllBookings() {
        // This would need to be filtered by agent in a real implementation
        // For now, return empty list
        return ResponseEntity.ok(new ApiResponse<>(true, "Bookings retrieved", List.of()));
    }

    @GetMapping("/bookings/agent/{agentId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getBookingsByAgent(@PathVariable Long agentId) {
        List<Booking> bookings = agentBookingService.getBookingsByAgent(agentId);
        String message = bookings.isEmpty() ? "No bookings found for this agent" : "Agent bookings retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, bookings));
    }

    @PutMapping("/bookings/{id}/confirm")
    public ResponseEntity<ApiResponse<Booking>> confirmBooking(@PathVariable Long id) {
        Booking confirmedBooking = agentBookingService.confirmBooking(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Booking confirmed successfully", confirmedBooking));
    }

    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(@PathVariable Long id) {
        Booking cancelledBooking = agentBookingService.cancelBooking(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Booking cancelled successfully", cancelledBooking));
    }
}