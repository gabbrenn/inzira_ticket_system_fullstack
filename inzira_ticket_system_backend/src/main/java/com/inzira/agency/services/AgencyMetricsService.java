package com.inzira.agency.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.agency.repositories.AgentRepository;
import com.inzira.agency.repositories.BranchOfficeRepository;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.BusRepository;
import com.inzira.shared.repositories.CustomerRepository;
import com.inzira.shared.repositories.DriverRepository;
import com.inzira.shared.repositories.ScheduleRepository;

@Service
public class AgencyMetricsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private BranchOfficeRepository branchOfficeRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public Map<String, Object> getAgencyMetrics(Long agencyId) {
        Map<String, Object> metrics = new HashMap<>();

        // Basic counts
        metrics.put("totalBuses", busRepository.findByAgencyId(agencyId).size());
        metrics.put("activeBuses", busRepository.findByAgencyIdAndStatus(agencyId, "ACTIVE").size());
        metrics.put("totalDrivers", driverRepository.findByAgencyId(agencyId).size());
        metrics.put("activeDrivers", driverRepository.findByAgencyIdAndStatus(agencyId, "ACTIVE").size());
        metrics.put("totalAgents", agentRepository.findByAgencyId(agencyId).size());
        metrics.put("activeAgents", agentRepository.findByAgencyIdAndStatus(agencyId, "ACTIVE").size());
        metrics.put("totalBranchOffices", branchOfficeRepository.findByAgencyId(agencyId).size());
        metrics.put("activeBranchOffices", branchOfficeRepository.findByAgencyIdAndStatus(agencyId, "ACTIVE").size());

        // Schedule metrics
        List<com.inzira.shared.entities.Schedule> todaySchedules = scheduleRepository.findByAgencyRouteAgencyId(agencyId)
            .stream()
            .filter(s -> s.getDepartureDate().equals(LocalDate.now()))
            .toList();
        metrics.put("todaySchedules", todaySchedules.size());

        List<com.inzira.shared.entities.Schedule> allSchedules = scheduleRepository.findByAgencyRouteAgencyId(agencyId);
        metrics.put("totalSchedules", allSchedules.size());

        // Booking metrics
        List<Booking> allBookings = getAllBookingsForAgency(agencyId);
        metrics.put("totalBookings", allBookings.size());

        long confirmedBookings = allBookings.stream()
            .filter(b -> "CONFIRMED".equals(b.getStatus()))
            .count();
        metrics.put("confirmedBookings", confirmedBookings);

        long completedBookings = allBookings.stream()
            .filter(b -> "COMPLETED".equals(b.getStatus()))
            .count();
        metrics.put("completedBookings", completedBookings);

        long pendingBookings = allBookings.stream()
            .filter(b -> "PENDING".equals(b.getStatus()))
            .count();
        metrics.put("pendingBookings", pendingBookings);

        // Revenue metrics
        BigDecimal totalRevenue = allBookings.stream()
            .filter(b -> "CONFIRMED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus()))
            .map(Booking::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        metrics.put("totalRevenue", totalRevenue);

        BigDecimal monthlyRevenue = allBookings.stream()
            .filter(b -> ("CONFIRMED".equals(b.getStatus()) || "COMPLETED".equals(b.getStatus())) 
                && b.getCreatedAt().getMonth() == LocalDate.now().getMonth()
                && b.getCreatedAt().getYear() == LocalDate.now().getYear())
            .map(Booking::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        metrics.put("monthlyRevenue", monthlyRevenue);

        // Customer metrics
        long uniqueCustomers = allBookings.stream()
            .map(b -> b.getCustomer().getId())
            .distinct()
            .count();
        metrics.put("uniqueCustomers", uniqueCustomers);

        return metrics;
    }

    private List<Booking> getAllBookingsForAgency(Long agencyId) {
        List<com.inzira.shared.entities.Schedule> agencySchedules = scheduleRepository.findByAgencyRouteAgencyId(agencyId);
        
        return agencySchedules.stream()
            .flatMap(schedule -> bookingRepository.findByScheduleId(schedule.getId()).stream())
            .toList();
    }
}