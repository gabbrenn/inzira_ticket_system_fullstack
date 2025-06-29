package com.inzira.customer.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.customer.services.BookingService;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.exceptions.ApiResponse;
import com.inzira.shared.exceptions.ResourceNotFoundException;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private BookingService bookingService;

    @GetMapping("/download/{bookingId}")
    public ResponseEntity<Resource> downloadTicket(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingService.getBookingById(bookingId);
            
            if (booking.getTicketPdfPath() == null) {
                throw new ResourceNotFoundException("Ticket PDF not available for this booking");
            }

            Path filePath = Paths.get("uploads").resolve(booking.getTicketPdfPath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new ResourceNotFoundException("Ticket file not found");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"ticket_" + booking.getBookingReference() + ".pdf\"")
                    .body(resource);

        } catch (Exception e) {
            throw new RuntimeException("Failed to download ticket", e);
        }
    }

    @GetMapping("/verify/{bookingReference}")
    public ResponseEntity<ApiResponse<Booking>> verifyTicket(@PathVariable String bookingReference) {
        Booking booking = bookingService.getBookingByReference(bookingReference);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ticket verified", booking));
    }
}