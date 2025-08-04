package com.inzira.driver.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.driver.services.DriverDashboardService;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/driver")
public class DriverDashboardController {

    @Autowired
    private DriverDashboardService driverDashboardService;

    @GetMapping("/schedules/{driverId}")
    public ResponseEntity<ApiResponse<List<Schedule>>> getDriverSchedules(@PathVariable Long driverId) {
        List<Schedule> schedules = driverDashboardService.getDriverSchedules(driverId);
        String message = schedules.isEmpty() ? "No schedules assigned" : "Driver schedules retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, schedules));
    }

    @GetMapping("/schedules/{driverId}/today")
    public ResponseEntity<ApiResponse<List<Schedule>>> getTodaySchedules(@PathVariable Long driverId) {
        List<Schedule> schedules = driverDashboardService.getTodaySchedules(driverId);
        String message = schedules.isEmpty() ? "No schedules for today" : "Today's schedules retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, schedules));
    }

    @GetMapping("/schedules/{driverId}/upcoming")
    public ResponseEntity<ApiResponse<List<Schedule>>> getUpcomingSchedules(@PathVariable Long driverId) {
        List<Schedule> schedules = driverDashboardService.getUpcomingSchedules(driverId);
        String message = schedules.isEmpty() ? "No upcoming schedules" : "Upcoming schedules retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, schedules));
    }

    @GetMapping("/schedules/{driverId}/date/{date}")
    public ResponseEntity<ApiResponse<List<Schedule>>> getSchedulesByDate(
            @PathVariable Long driverId,
            @PathVariable LocalDate date) {
        List<Schedule> schedules = driverDashboardService.getSchedulesByDate(driverId, date);
        String message = schedules.isEmpty() ? "No schedules for this date" : "Schedules retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, schedules));
    }
}