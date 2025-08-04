package com.inzira.driver.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inzira.driver.dtos.TicketVerificationResponse;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.entities.Driver;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.DriverRepository;
import com.inzira.shared.repositories.ScheduleRepository;

@Service
public class TicketVerificationService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Transactional
    public TicketVerificationResponse verifyTicketByReference(Long driverId, String bookingReference) {
        // Validate driver exists
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        // Find booking by reference
        Optional<Booking> bookingOpt = bookingRepository.findByBookingReference(bookingReference);
        if (bookingOpt.isEmpty()) {
            return new TicketVerificationResponse(false, "Booking not found", "NOT_FOUND");
        }

        Booking booking = bookingOpt.get();
        return validateAndMarkTicket(driver, booking);
    }

    @Transactional
    public TicketVerificationResponse verifyTicketByQRCode(Long driverId, String qrData) {
        // Validate driver exists
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        // Extract booking reference from QR data
        // QR format: "INZIRA_TICKET|REF:bookingRef|EMAIL:email|ROUTE:route|DATE:date"
        String bookingReference = extractBookingReferenceFromQR(qrData);
        if (bookingReference == null) {
            return new TicketVerificationResponse(false, "Invalid QR code format", "INVALID_QR");
        }

        // Find booking by reference
        Optional<Booking> bookingOpt = bookingRepository.findByBookingReference(bookingReference);
        if (bookingOpt.isEmpty()) {
            return new TicketVerificationResponse(false, "Booking not found", "NOT_FOUND");
        }

        Booking booking = bookingOpt.get();
        return validateAndMarkTicket(driver, booking);
    }

    public TicketVerificationResponse getScheduleBookingsForDriver(Long driverId, Long scheduleId) {
        // Validate driver exists
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        // Validate schedule exists and belongs to driver
        Schedule schedule = scheduleRepository.findById(scheduleId)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        if (!schedule.getDriver().getId().equals(driverId)) {
            return new TicketVerificationResponse(false, "Schedule not assigned to this driver", "INVALID_SCHEDULE");
        }

        // Get all bookings for this schedule
        List<Booking> bookings = bookingRepository.findByScheduleId(scheduleId);
        
        TicketVerificationResponse response = new TicketVerificationResponse();
        response.setValid(true);
        response.setMessage("Schedule bookings retrieved successfully");
        response.setStatus("SUCCESS");
        response.setScheduleInfo(schedule.getAgencyRoute().getRoute().getOrigin().getName() + " → " + 
                                schedule.getAgencyRoute().getRoute().getDestination().getName());
        response.setAgencyName(schedule.getAgencyRoute().getAgency().getAgencyName());
        
        return response;
    }

    private TicketVerificationResponse validateAndMarkTicket(Driver driver, Booking booking) {
        Schedule schedule = booking.getSchedule();
        
        // Check if booking is confirmed
        if (!"CONFIRMED".equals(booking.getStatus()) && !"COMPLETED".equals(booking.getStatus())) {
            return createErrorResponse("Ticket is not confirmed", "INVALID_STATUS", booking, schedule);
        }

        // Check if ticket belongs to driver's agency
        if (!schedule.getAgencyRoute().getAgency().getId().equals(driver.getAgency().getId())) {
            return createErrorResponse("Ticket belongs to different agency", "INVALID_AGENCY", booking, schedule);
        }

        // Check if ticket belongs to driver's schedule
        if (!schedule.getDriver().getId().equals(driver.getId())) {
            return createErrorResponse("Ticket not assigned to this driver", "INVALID_SCHEDULE", booking, schedule);
        }

        // Check if ticket has already been used
        if ("COMPLETED".equals(booking.getStatus())) {
            return createUsedTicketResponse(booking, schedule);
        }

        // Mark ticket as used (completed)
        booking.setStatus("COMPLETED");
        bookingRepository.save(booking);

        // Create successful verification response
        TicketVerificationResponse response = new TicketVerificationResponse();
        response.setValid(true);
        response.setMessage("Ticket verified successfully");
        response.setStatus("VALID");
        response.setBookingReference(booking.getBookingReference());
        response.setCustomerName(booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName());
        response.setCustomerPhone(booking.getCustomer().getPhoneNumber());
        response.setNumberOfSeats(booking.getNumberOfSeats());
        response.setTotalAmount(booking.getTotalAmount());
        response.setPickupPointName(booking.getPickupPoint().getName());
        response.setDropPointName(booking.getDropPoint().getName());
        response.setRouteInfo(schedule.getAgencyRoute().getRoute().getOrigin().getName() + " → " + 
                             schedule.getAgencyRoute().getRoute().getDestination().getName());
        response.setVerifiedAt(LocalDateTime.now());
        response.setAlreadyUsed(false);
        response.setScheduleInfo(schedule.getDepartureDate() + " at " + schedule.getDepartureTime());
        response.setAgencyName(schedule.getAgencyRoute().getAgency().getAgencyName());

        return response;
    }

    private TicketVerificationResponse createErrorResponse(String message, String status, Booking booking, Schedule schedule) {
        TicketVerificationResponse response = new TicketVerificationResponse(false, message, status);
        response.setBookingReference(booking.getBookingReference());
        response.setCustomerName(booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName());
        response.setRouteInfo(schedule.getAgencyRoute().getRoute().getOrigin().getName() + " → " + 
                             schedule.getAgencyRoute().getRoute().getDestination().getName());
        response.setScheduleInfo(schedule.getDepartureDate() + " at " + schedule.getDepartureTime());
        response.setAgencyName(schedule.getAgencyRoute().getAgency().getAgencyName());
        return response;
    }

    private TicketVerificationResponse createUsedTicketResponse(Booking booking, Schedule schedule) {
        TicketVerificationResponse response = new TicketVerificationResponse();
        response.setValid(false);
        response.setMessage("Ticket has already been used");
        response.setStatus("ALREADY_USED");
        response.setBookingReference(booking.getBookingReference());
        response.setCustomerName(booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName());
        response.setCustomerPhone(booking.getCustomer().getPhoneNumber());
        response.setNumberOfSeats(booking.getNumberOfSeats());
        response.setTotalAmount(booking.getTotalAmount());
        response.setPickupPointName(booking.getPickupPoint().getName());
        response.setDropPointName(booking.getDropPoint().getName());
        response.setRouteInfo(schedule.getAgencyRoute().getRoute().getOrigin().getName() + " → " + 
                             schedule.getAgencyRoute().getRoute().getDestination().getName());
        response.setAlreadyUsed(true);
        response.setScheduleInfo(schedule.getDepartureDate() + " at " + schedule.getDepartureTime());
        response.setAgencyName(schedule.getAgencyRoute().getAgency().getAgencyName());

        return response;
    }

    private String extractBookingReferenceFromQR(String qrData) {
        try {
            // QR format: "INZIRA_TICKET|REF:bookingRef|EMAIL:email|ROUTE:route|DATE:date"
            if (!qrData.startsWith("INZIRA_TICKET|")) {
                return null;
            }

            String[] parts = qrData.split("\\|");
            for (String part : parts) {
                if (part.startsWith("REF:")) {
                    return part.substring(4); // Remove "REF:" prefix
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}