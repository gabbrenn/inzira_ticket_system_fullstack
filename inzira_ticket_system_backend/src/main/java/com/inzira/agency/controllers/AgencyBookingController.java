package com.inzira.agency.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.shared.entities.Booking;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ApiResponse;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.ScheduleRepository;

@RestController
@RequestMapping("/api/agency/bookings")
public class AgencyBookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getBookingsByAgency(@PathVariable Long agencyId) {
        // Get all schedules for the agency
        List<Schedule> agencySchedules = scheduleRepository.findByAgencyRouteAgencyId(agencyId);
        
        // Get all bookings for these schedules
        List<Booking> bookings = agencySchedules.stream()
            .flatMap(schedule -> bookingRepository.findByScheduleId(schedule.getId()).stream())
            .toList();

        String message = bookings.isEmpty() ? "No bookings found for this agency" : "Agency bookings retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, bookings));
    }

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getBookingsBySchedule(@PathVariable Long scheduleId) {
        List<Booking> bookings = bookingRepository.findByScheduleId(scheduleId);
        String message = bookings.isEmpty() ? "No bookings found for this schedule" : "Schedule bookings retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, bookings));
    }
}