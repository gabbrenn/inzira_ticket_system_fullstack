package com.inzira.agent.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.agency.entities.Agent;
import com.inzira.agency.repositories.AgentRepository;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.ScheduleRepository;

@Service
public class AgentReportsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private AgentRepository agentRepository;

    public List<Booking> getDailyBookingsByAgent(Long agentId, LocalDate date) {
        Agent agent = agentRepository.findById(agentId)
            .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        // Get all schedules for the agent's agency
        List<Schedule> agencySchedules = scheduleRepository.findByAgencyRouteAgencyId(agent.getAgency().getId());
        
        // Get all bookings for these schedules created on the specified date
        return agencySchedules.stream()
            .flatMap(schedule -> bookingRepository.findByScheduleId(schedule.getId()).stream())
            .filter(booking -> {
                LocalDateTime createdAt = booking.getCreatedAt();
                return createdAt.isAfter(startOfDay) && createdAt.isBefore(endOfDay);
            })
            .toList();
    }

    public List<Booking> getScheduleBookingsByAgent(Long agentId, Long scheduleId) {
        Agent agent = agentRepository.findById(agentId)
            .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        Schedule schedule = scheduleRepository.findById(scheduleId)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        // Verify the schedule belongs to the agent's agency
        if (!schedule.getAgencyRoute().getAgency().getId().equals(agent.getAgency().getId())) {
            throw new IllegalArgumentException("Schedule does not belong to agent's agency");
        }

        return bookingRepository.findByScheduleId(scheduleId);
    }

    public List<Schedule> getSchedulesByAgentAgency(Long agentId) {
        Agent agent = agentRepository.findById(agentId)
            .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        return scheduleRepository.findByAgencyRouteAgencyId(agent.getAgency().getId());
    }
}