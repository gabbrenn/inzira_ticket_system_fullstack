package com.inzira.customer.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inzira.customer.dtos.AgentBookingRequest;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.entities.Customer;
import com.inzira.shared.entities.RoutePoint;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.CustomerRepository;
import com.inzira.shared.repositories.RoutePointRepository;
import com.inzira.shared.repositories.ScheduleRepository;
import com.inzira.shared.services.QRCodeService;
import com.inzira.shared.services.PDFTicketService;

@Service
public class GuestBookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private RoutePointRepository routePointRepository;

    @Autowired
    private QRCodeService qrCodeService;

    @Autowired
    private PDFTicketService pdfTicketService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public Booking createGuestBooking(AgentBookingRequest request) {
        // Find or create customer
        Customer customer = findOrCreateCustomer(request);

        // Validate schedule exists and is available
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        if (!"SCHEDULED".equals(schedule.getStatus())) {
            throw new IllegalArgumentException("Schedule is not available for booking");
        }

        // Check seat availability
        if (schedule.getAvailableSeats() < request.getNumberOfSeats()) {
            throw new IllegalArgumentException("Not enough seats available. Available: " + schedule.getAvailableSeats());
        }

        // Validate pickup and drop points
        RoutePoint pickupPoint = routePointRepository.findById(request.getPickupPointId())
            .orElseThrow(() -> new ResourceNotFoundException("Pickup point not found"));

        RoutePoint dropPoint = routePointRepository.findById(request.getDropPointId())
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
        BigDecimal totalAmount = pricePerSeat.multiply(BigDecimal.valueOf(request.getNumberOfSeats()));

        // Generate QR Code
        String qrData = qrCodeService.generateTicketQRData(
            bookingReference,
            customer.getEmail(),
            schedule.getAgencyRoute().getRoute().getOrigin().getName() + " → " + schedule.getAgencyRoute().getRoute().getDestination().getName(),
            schedule.getDepartureDate().toString()
        );
        String qrCode = qrCodeService.generateQRCode(qrData);

        // Create booking
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setSchedule(schedule);
        booking.setPickupPoint(pickupPoint);
        booking.setDropPoint(dropPoint);
        booking.setBookingReference(bookingReference);
        booking.setTotalAmount(totalAmount);
        booking.setNumberOfSeats(request.getNumberOfSeats());
        booking.setStatus("CONFIRMED"); // Guest bookings are automatically confirmed
        booking.setPaymentStatus("PAID"); // Assume payment is handled
        booking.setQrCode(qrCode);
        booking.setCreatedBy("GUEST");

        // Save booking first
        Booking savedBooking = bookingRepository.save(booking);

        // Generate PDF ticket
        try {
            String pdfPath = pdfTicketService.generateTicketPDF(savedBooking);
            savedBooking.setTicketPdfPath(pdfPath);
            savedBooking = bookingRepository.save(savedBooking);
        } catch (Exception e) {
            // PDF generation failed, but booking is still valid
            System.err.println("Failed to generate PDF ticket: " + e.getMessage());
        }

        // Update available seats
        schedule.setAvailableSeats(schedule.getAvailableSeats() - request.getNumberOfSeats());
        scheduleRepository.save(schedule);

        return savedBooking;
    }

    private Customer findOrCreateCustomer(AgentBookingRequest request) {
        // Try to find existing customer by email or phone
        Customer existingCustomer = null;
        
        if (request.getCustomerEmail() != null && !request.getCustomerEmail().trim().isEmpty()) {
            existingCustomer = customerRepository.findByEmail(request.getCustomerEmail()).orElse(null);
        }
        
        if (existingCustomer == null) {
            // Try to find by phone number
            // Note: You might want to add a findByPhoneNumber method to CustomerRepository
        }
        
        if (existingCustomer != null) {
            return existingCustomer;
        }

        // Create new customer
        Customer customer = new Customer();
        customer.setFirstName(request.getCustomerFirstName());
        customer.setLastName(request.getCustomerLastName());
        customer.setEmail(request.getCustomerEmail() != null ? request.getCustomerEmail() : generateTempEmail(request));
        customer.setPhoneNumber(request.getCustomerPhoneNumber());
        customer.setPassword(passwordEncoder.encode("guest123")); // Temporary password for guest users
        customer.setStatus("ACTIVE");

        return customerRepository.save(customer);
    }

    private String generateTempEmail(AgentBookingRequest request) {
        // Generate temporary email for customers without email
        String firstName = request.getCustomerFirstName().toLowerCase().replaceAll("\\s+", "");
        String lastName = request.getCustomerLastName().toLowerCase().replaceAll("\\s+", "");
        String timestamp = String.valueOf(System.currentTimeMillis());
        return firstName + "." + lastName + "." + timestamp + "@guest.inzira.com";
    }

    private String generateBookingReference() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "GT" + timestamp + uuid; // GT prefix for guest bookings
    }
}