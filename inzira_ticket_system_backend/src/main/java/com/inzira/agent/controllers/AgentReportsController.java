package com.inzira.agent.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.agent.services.AgentReportsService;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/agent/reports")
public class AgentReportsController {

    @Autowired
    private AgentReportsService agentReportsService;

    @GetMapping("/daily/{agentId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getDailyBookings(
            @PathVariable Long agentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        List<Booking> bookings = agentReportsService.getDailyBookingsByAgent(agentId, date);
        String message = bookings.isEmpty() ? "No bookings found for this date" : "Daily bookings retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, bookings));
    }

    @GetMapping("/schedule/{agentId}/{scheduleId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getScheduleBookings(
            @PathVariable Long agentId,
            @PathVariable Long scheduleId) {
        
        List<Booking> bookings = agentReportsService.getScheduleBookingsByAgent(agentId, scheduleId);
        String message = bookings.isEmpty() ? "No bookings found for this schedule" : "Schedule bookings retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, bookings));
    }

    @GetMapping("/schedules/{agentId}")
    public ResponseEntity<ApiResponse<List<Schedule>>> getAgentSchedules(@PathVariable Long agentId) {
        List<Schedule> schedules = agentReportsService.getSchedulesByAgentAgency(agentId);
        String message = schedules.isEmpty() ? "No schedules found" : "Agent schedules retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, schedules));
    }
}