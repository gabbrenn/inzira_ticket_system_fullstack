package com.inzira.agency.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.agency.services.AgencyMetricsService;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/agency/metrics")
public class AgencyMetricsController {

    @Autowired
    private AgencyMetricsService agencyMetricsService;

    @GetMapping("/{agencyId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAgencyMetrics(@PathVariable Long agencyId) {
        Map<String, Object> metrics = agencyMetricsService.getAgencyMetrics(agencyId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agency metrics retrieved successfully", metrics));
    }
}