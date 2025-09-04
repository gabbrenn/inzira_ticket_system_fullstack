package com.inzira.admin.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inzira.admin.dtos.AdminMetricsSummary;
import com.inzira.admin.services.AdminMetricsService;
import com.inzira.shared.exceptions.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/metrics")
@RequiredArgsConstructor
public class AdminMetricsController {

    private final AdminMetricsService adminMetricsService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AdminMetricsSummary>> getSummary() {
        AdminMetricsSummary summary = adminMetricsService.getSummary();
        return ResponseEntity.ok(new ApiResponse<>(true, "Admin metrics summary", summary));
    }
}
