package com.inzira.branch_manager.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.agency.repositories.AgentRepository;
import com.inzira.branch_manager.entities.BranchManager;
import com.inzira.branch_manager.repositories.BranchManagerRepository;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.ScheduleRepository;

@Service
public class BranchManagerMetricsService {

    @Autowired
    private BranchManagerRepository branchManagerRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AgentRepository agentRepository;

    public Map<String, Object> getBranchManagerMetrics(Long branchManagerId) {
        BranchManager branchManager = branchManagerRepository.findById(branchManagerId)
            .orElseThrow(() -> new ResourceNotFoundException("Branch manager not found"));

        Map<String, Object> metrics = new HashMap<>();

        Long agencyId = branchManager.getAgency().getId();
        Long branchOfficeId = branchManager.getBranchOffice().getId();

        // Agent metrics for this branch
        metrics.put("totalAgents", agentRepository.findByBranchOfficeId(branchOfficeId).size());
        metrics.put("activeAgents", agentRepository.findByAgencyIdAndStatus(agencyId, "ACTIVE")
            .stream()
            .filter(agent -> agent.getBranchOffice().getId().equals(branchOfficeId))
            .count());
        metrics.put("confirmedAgents", agentRepository.findByBranchOfficeId(branchOfficeId)
            .stream()
            .filter(agent -> agent.getConfirmedByAgency())
            .count());

        // Schedule metrics for this agency (branch managers can see all agency schedules)
        List<Schedule> agencySchedules = scheduleRepository.findByAgencyRouteAgencyId(agencyId);
        metrics.put("totalSchedules", agencySchedules.size());

        List<Schedule> todaySchedules = agencySchedules.stream()
            .filter(s -> s.getDepartureDate().equals(LocalDate.now()))
            .toList();
        metrics.put("todaySchedules", todaySchedules.size());

        // Booking metrics for agency schedules
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

        // Branch office info
        metrics.put("branchOfficeName", branchManager.getBranchOffice().getOfficeName());
        metrics.put("agencyName", branchManager.getAgency().getAgencyName());

        return metrics;
    }

    public List<Schedule> getSchedulesByBranchManager(Long branchManagerId) {
        BranchManager branchManager = branchManagerRepository.findById(branchManagerId)
            .orElseThrow(() -> new ResourceNotFoundException("Branch manager not found"));

        return scheduleRepository.findByAgencyRouteAgencyId(branchManager.getAgency().getId());
    }

    public List<Booking> getBookingsBySchedule(Long scheduleId) {
        return bookingRepository.findByScheduleId(scheduleId);
    }

    private List<Booking> getAllBookingsForAgency(Long agencyId) {
        List<Schedule> agencySchedules = scheduleRepository.findByAgencyRouteAgencyId(agencyId);
        
        return agencySchedules.stream()
            .flatMap(schedule -> bookingRepository.findByScheduleId(schedule.getId()).stream())
            .toList();
    }
}