package com.inzira.customer.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inzira.shared.entities.Booking;
import com.inzira.shared.entities.Customer;
import com.inzira.shared.entities.RoutePoint;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.CustomerRepository;
import com.inzira.shared.repositories.RoutePointRepository;
import com.inzira.shared.repositories.ScheduleRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private RoutePointRepository routePointRepository;

    @Transactional
    public Booking createBooking(Booking booking) {
        // Validate customer exists
        Customer customer = customerRepository.findById(booking.getCustomer().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Validate schedule exists and is available
        Schedule schedule = scheduleRepository.findById(booking.getSchedule().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        if (!"SCHEDULED".equals(schedule.getStatus())) {
            throw new IllegalArgumentException("Schedule is not available for booking");
        }

        // Check seat availability
        if (schedule.getAvailableSeats() < booking.getNumberOfSeats()) {
            throw new IllegalArgumentException("Not enough seats available. Available: " + schedule.getAvailableSeats());
        }

        // Validate pickup and drop points
        RoutePoint pickupPoint = routePointRepository.findById(booking.getPickupPoint().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Pickup point not found"));

        RoutePoint dropPoint = routePointRepository.findById(booking.getDropPoint().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Drop point not found"));

        // Validate that pickup point belongs to origin district and drop point belongs to destination district
        if (!pickupPoint.getDistrict().getId().equals(schedule.getAgencyRoute().getRoute().getOrigin().getId())) {
            throw new IllegalArgumentException("Pickup point must be in the origin district");
        }

        if (!dropPoint.getDistrict().getId().equals(schedule.getAgencyRoute().getRoute().getDestination().getId())) {
            throw new IllegalArgumentException("Drop point must be in the destination district");
        }

        // Generate booking reference
        String bookingReference = generateBookingReference();

        // Calculate total amount
        BigDecimal pricePerSeat = BigDecimal.valueOf(schedule.getAgencyRoute().getPrice());
        BigDecimal totalAmount = pricePerSeat.multiply(BigDecimal.valueOf(booking.getNumberOfSeats()));

        // Set booking details
        booking.setCustomer(customer);
        booking.setSchedule(schedule);
        booking.setPickupPoint(pickupPoint);
        booking.setDropPoint(dropPoint);
        booking.setBookingReference(bookingReference);
        booking.setTotalAmount(totalAmount);
        booking.setStatus("PENDING");
        booking.setPaymentStatus("PENDING");

        // Update available seats
        schedule.setAvailableSeats(schedule.getAvailableSeats() - booking.getNumberOfSeats());
        scheduleRepository.save(schedule);

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }

    public Booking getBookingByReference(String bookingReference) {
        return bookingRepository.findByBookingReference(bookingReference)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + bookingReference));
    }

    public List<Booking> getBookingsByCustomer(Long customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }

    public List<Booking> getBookingsBySchedule(Long scheduleId) {
        return bookingRepository.findByScheduleId(scheduleId);
    }

    @Transactional
    public Booking confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Only pending bookings can be confirmed");
        }

        booking.setStatus("CONFIRMED");
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if ("COMPLETED".equals(booking.getStatus()) || "CANCELLED".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Cannot cancel completed or already cancelled booking");
        }

        // Restore available seats
        Schedule schedule = booking.getSchedule();
        schedule.setAvailableSeats(schedule.getAvailableSeats() + booking.getNumberOfSeats());
        scheduleRepository.save(schedule);

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    private String generateBookingReference() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "BK" + timestamp + uuid;
    }
}