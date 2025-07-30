package com.inzira.agency.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.agency.services.ScheduleService;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/agency/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<ApiResponse<Schedule>> createSchedule(@RequestBody Schedule schedule) {
        Schedule createdSchedule = scheduleService.createSchedule(schedule);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Schedule created successfully", createdSchedule));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Schedule>>> getAllSchedules() {
        List<Schedule> schedules = scheduleService.getAllSchedules();
        String message = schedules.isEmpty() ? "No schedules found" : "Schedules retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, schedules));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Schedule>> getScheduleById(@PathVariable Long id) {
        Schedule schedule = scheduleService.getScheduleById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Schedule found", schedule));
    }

    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<ApiResponse<List<Schedule>>> getSchedulesByAgency(@PathVariable Long agencyId) {
        List<Schedule> schedules = scheduleService.getSchedulesByAgency(agencyId);
        String message = schedules.isEmpty() ? "No schedules found for this agency" : "Agency schedules retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, schedules));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Schedule>>> searchSchedules(
            @RequestParam Long originId,
            @RequestParam Long destinationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureDate,
            @RequestParam(required = false) Long agencyId) {
        
        List<Schedule> schedules;
        if (agencyId != null) {
            schedules = scheduleService.searchSchedulesByAgency(originId, destinationId, departureDate, agencyId);
        } else {
            schedules = scheduleService.searchSchedules(originId, destinationId, departureDate);
        }
        
        String message = schedules.isEmpty() ? "No schedules found for the specified criteria" : "Schedules found";
        return ResponseEntity.ok(new ApiResponse<>(true, message, schedules));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Schedule>> updateSchedule(@PathVariable Long id, @RequestBody Schedule schedule) {
        Schedule updatedSchedule = scheduleService.updateSchedule(id, schedule);
        return ResponseEntity.ok(new ApiResponse<>(true, "Schedule updated successfully", updatedSchedule));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelSchedule(@PathVariable Long id) {
        scheduleService.cancelSchedule(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Schedule cancelled successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Schedule deleted successfully"));
    }
}