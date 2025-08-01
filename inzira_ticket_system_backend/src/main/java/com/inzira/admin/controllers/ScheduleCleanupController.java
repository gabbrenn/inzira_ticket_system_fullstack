package com.inzira.admin.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.admin.services.ScheduleCleanupService;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/admin/schedules")
public class ScheduleCleanupController {

    @Autowired
    private ScheduleCleanupService scheduleCleanupService;

    @PostMapping("/cleanup-expired")
    public ResponseEntity<ApiResponse<Integer>> cleanupExpiredSchedules() {
        int updatedCount = scheduleCleanupService.manuallyUpdateExpiredSchedules();
        return ResponseEntity.ok(new ApiResponse<>(true, 
            "Updated " + updatedCount + " expired schedules", updatedCount));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ScheduleCleanupService.ScheduleStats>> getScheduleStats() {
        ScheduleCleanupService.ScheduleStats stats = scheduleCleanupService.getScheduleStats();
        return ResponseEntity.ok(new ApiResponse<>(true, "Schedule statistics retrieved", stats));
    }
}