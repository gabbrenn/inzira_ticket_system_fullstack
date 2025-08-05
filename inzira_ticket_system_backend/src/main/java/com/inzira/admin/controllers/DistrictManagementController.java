package com.inzira.admin.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.admin.services.DistrictService;
import com.inzira.admin.services.ProvinceService;
import com.inzira.shared.entities.District;
import com.inzira.shared.entities.Province;
import com.inzira.shared.entities.RoutePoint;
import com.inzira.shared.exceptions.ApiResponse;
import com.inzira.shared.services.RoutePointService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/districts")
public class DistrictManagementController {

    @Autowired
    private DistrictService districtService;

    @Autowired
    private ProvinceService provinceService;

    @Autowired
    private RoutePointService routePointService;

    // Create District
    @PostMapping
    public ResponseEntity<ApiResponse<District>> createDistrict(@RequestBody District district) {
        // Validate province exists
        if (district.getProvince() == null || district.getProvince().getId() == null) {
            throw new IllegalArgumentException("Province is required");
        }
        
        District createdDistrict = districtService.createDistrict(district);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "District created successfully", createdDistrict));
    }

    // Get All Districts
    @GetMapping
    public ResponseEntity<ApiResponse<List<District>>> getAllDistricts() {
        List<District> districts = districtService.getAll();
        String message = districts.isEmpty() ? "No districts found" : "Districts retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, districts));
    }

    // Get District by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<District>> getDistrictById(@PathVariable Long id) {
        District district = districtService.getById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "District found", district));
    }

    // Update District
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<District>> updateDistrict(
            @PathVariable Long id, 
            @RequestBody District district) {
        District updatedDistrict = districtService.updateDistrict(id, district);
        return ResponseEntity.ok(new ApiResponse<>(true, "District updated successfully", updatedDistrict));
    }

    // Delete District
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDistrict(@PathVariable Long id) {
        districtService.deleteDistrict(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "District deleted successfully"));
    }

    // Add RoutePoint to District
    @PostMapping("/{districtId}/points")
    public ResponseEntity<ApiResponse<RoutePoint>> addRoutePointToDistrict(
            @PathVariable Long districtId, 
            @RequestBody RoutePoint routePoint) {
        District district = districtService.getById(districtId);
        routePoint.setDistrict(district);
        RoutePoint createdRoutePoint = routePointService.createLocation(routePoint);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Route point added successfully", createdRoutePoint));
    }

    // Update RoutePoint in District
    @PutMapping("/{districtId}/points/{pointId}")
    public ResponseEntity<ApiResponse<RoutePoint>> updateRoutePointInDistrict(
            @PathVariable Long districtId,
            @PathVariable Long pointId,
            @RequestBody RoutePoint updatedRoutePoint) {
        
        // Validate district exists
        District district = districtService.getById(districtId);
        
        // Validate route point exists and belongs to district
        RoutePoint existingRoutePoint = routePointService.getById(pointId);
        if (!existingRoutePoint.getDistrict().getId().equals(districtId)) {
            throw new IllegalArgumentException("Route point does not belong to the specified district");
        }

        updatedRoutePoint.setDistrict(district);
        RoutePoint updated = routePointService.updateLocation(pointId, updatedRoutePoint);
        return ResponseEntity.ok(new ApiResponse<>(true, "Route point updated successfully", updated));
    }

    // Delete RoutePoint from District
    @DeleteMapping("/{districtId}/points/{pointId}")
    public ResponseEntity<ApiResponse<Void>> deleteRoutePointFromDistrict(
            @PathVariable Long districtId, 
            @PathVariable Long pointId) {
        
        // Validate route point exists and belongs to district
        RoutePoint routePoint = routePointService.getById(pointId);
        if (!routePoint.getDistrict().getId().equals(districtId)) {
            throw new IllegalArgumentException("Route point does not belong to the specified district");
        }
        
        routePointService.deleteLocation(pointId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Route point deleted successfully"));
    }

    // Get RoutePoints by District
    @GetMapping("/{districtId}/points")
    public ResponseEntity<ApiResponse<List<RoutePoint>>> getRoutePointsByDistrict(@PathVariable Long districtId) {
        // Validate district exists
        districtService.getById(districtId);
        
        List<RoutePoint> routePoints = routePointService.getByDistrict(districtId);
        String message = routePoints.isEmpty() ? "No route points found in this district" : "Route points retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, routePoints));
    }
}