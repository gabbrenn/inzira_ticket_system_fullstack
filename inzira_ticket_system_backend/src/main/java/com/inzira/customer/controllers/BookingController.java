package com.inzira.customer.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.customer.services.BookingService;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(@RequestBody Booking booking) {
        Booking createdBooking = bookingService.createBooking(booking);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Booking created successfully", createdBooking));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Booking>>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        String message = bookings.isEmpty() ? "No bookings found" : "Bookings retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Booking found", booking));
    }

    @GetMapping("/reference/{bookingReference}")
    public ResponseEntity<ApiResponse<Booking>> getBookingByReference(@PathVariable String bookingReference) {
        Booking booking = bookingService.getBookingByReference(bookingReference);
        return ResponseEntity.ok(new ApiResponse<>(true, "Booking found", booking));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getBookingsByCustomer(@PathVariable Long customerId) {
        List<Booking> bookings = bookingService.getBookingsByCustomer(customerId);
        String message = bookings.isEmpty() ? "No bookings found for this customer" : "Customer bookings retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, bookings));
    }

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getBookingsBySchedule(@PathVariable Long scheduleId) {
        List<Booking> bookings = bookingService.getBookingsBySchedule(scheduleId);
        String message = bookings.isEmpty() ? "No bookings found for this schedule" : "Schedule bookings retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, bookings));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<Booking>> confirmBooking(@PathVariable Long id) {
        Booking confirmedBooking = bookingService.confirmBooking(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Booking confirmed successfully", confirmedBooking));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(@PathVariable Long id) {
        Booking cancelledBooking = bookingService.cancelBooking(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Booking cancelled successfully", cancelledBooking));
    }
}