package com.inzira.customer.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inzira.agency.entities.Agent;
import com.inzira.agency.repositories.AgentRepository;
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
public class AgentBookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private RoutePointRepository routePointRepository;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private QRCodeService qrCodeService;

    @Autowired
    private PDFTicketService pdfTicketService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public Booking createBookingForCustomer(AgentBookingRequest request) {
        // Validate agent exists and is confirmed
        Agent agent = agentRepository.findById(request.getAgentId())
            .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        if (!agent.getConfirmedByAgency()) {
            throw new IllegalArgumentException("Agent is not confirmed by agency");
        }

        if (!"ACTIVE".equals(agent.getStatus())) {
            throw new IllegalArgumentException("Agent is not active");
        }

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
        booking.setStatus("CONFIRMED"); // Agent bookings are automatically confirmed
        booking.setPaymentStatus("PAID"); // Assume payment is handled by agent
        booking.setQrCode(qrCode);
        booking.setCreatedBy("AGENT");
        booking.setCreatedByAgentId(request.getAgentId());

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
        // Try to find existing customer by email
        if (request.getCustomerEmail() != null && !request.getCustomerEmail().trim().isEmpty()) {
            Customer existingCustomer = customerRepository.findByEmail(request.getCustomerEmail()).orElse(null);
            if (existingCustomer != null) {
                return existingCustomer;
            }
        }

        // Create new customer
        Customer customer = new Customer();
        customer.setFirstName(request.getCustomerFirstName());
        customer.setLastName(request.getCustomerLastName());
        customer.setEmail(request.getCustomerEmail() != null ? request.getCustomerEmail() : generateTempEmail(request));
        customer.setPhoneNumber(request.getCustomerPhoneNumber());
        customer.setPassword(passwordEncoder.encode("temp123")); // Temporary password
        customer.setStatus("ACTIVE");

        return customerRepository.save(customer);
    }

    private String generateTempEmail(AgentBookingRequest request) {
        // Generate temporary email for customers without email
        String firstName = request.getCustomerFirstName().toLowerCase().replaceAll("\\s+", "");
        String lastName = request.getCustomerLastName().toLowerCase().replaceAll("\\s+", "");
        String timestamp = String.valueOf(System.currentTimeMillis());
        return firstName + "." + lastName + "." + timestamp + "@temp.inzira.com";
    }

    public List<Booking> getBookingsByAgent(Long agentId) {
        // This would require tracking which agent created which booking
        // For now, return all bookings for the agent's agency
        Agent agent = agentRepository.findById(agentId)
            .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        // Get all schedules for the agent's agency
        List<Schedule> agencySchedules = scheduleRepository.findByAgencyRouteAgencyId(agent.getAgency().getId());
        
        // Get all bookings for these schedules
        return agencySchedules.stream()
            .flatMap(schedule -> bookingRepository.findByScheduleId(schedule.getId()).stream())
            .toList();
    }

    @Transactional
    public Booking confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Only pending bookings can be confirmed");
        }

        booking.setStatus("CONFIRMED");
        booking.setPaymentStatus("PAID");
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
        return "AG" + timestamp + uuid; // AG prefix for agent bookings
    }
}