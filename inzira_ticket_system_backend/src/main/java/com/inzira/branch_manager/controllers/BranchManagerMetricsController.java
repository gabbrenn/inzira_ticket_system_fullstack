package com.inzira.branch_manager.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.branch_manager.services.BranchManagerMetricsService;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/branch-manager/metrics")
public class BranchManagerMetricsController {

    @Autowired
    private BranchManagerMetricsService branchManagerMetricsService;

    @GetMapping("/{branchManagerId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBranchManagerMetrics(@PathVariable Long branchManagerId) {
        Map<String, Object> metrics = branchManagerMetricsService.getBranchManagerMetrics(branchManagerId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Branch manager metrics retrieved successfully", metrics));
    }

    @GetMapping("/{branchManagerId}/schedules")
    public ResponseEntity<ApiResponse<List<Schedule>>> getSchedulesByBranchManager(@PathVariable Long branchManagerId) {
        List<Schedule> schedules = branchManagerMetricsService.getSchedulesByBranchManager(branchManagerId);
        String message = schedules.isEmpty() ? "No schedules found" : "Schedules retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, schedules));
    }

    @GetMapping("/bookings/schedule/{scheduleId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getBookingsBySchedule(@PathVariable Long scheduleId) {
        List<Booking> bookings = branchManagerMetricsService.getBookingsBySchedule(scheduleId);
        String message = bookings.isEmpty() ? "No bookings found for this schedule" : "Schedule bookings retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, bookings));
    }
}