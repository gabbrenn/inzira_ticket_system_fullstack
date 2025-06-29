package com.inzira.agency.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.agency.services.DriverService;
import com.inzira.shared.entities.Driver;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/agency/drivers")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @PostMapping
    public ResponseEntity<ApiResponse<Driver>> createDriver(@RequestBody Driver driver) {
        Driver createdDriver = driverService.createDriver(driver);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Driver created successfully", createdDriver));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Driver>>> getAllDrivers() {
        List<Driver> drivers = driverService.getAllDrivers();
        String message = drivers.isEmpty() ? "No drivers found" : "Drivers retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, drivers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Driver>> getDriverById(@PathVariable Long id) {
        Driver driver = driverService.getDriverById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver found", driver));
    }

    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<ApiResponse<List<Driver>>> getDriversByAgency(@PathVariable Long agencyId) {
        List<Driver> drivers = driverService.getDriversByAgency(agencyId);
        String message = drivers.isEmpty() ? "No drivers found for this agency" : "Agency drivers retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, drivers));
    }

    @GetMapping("/agency/{agencyId}/active")
    public ResponseEntity<ApiResponse<List<Driver>>> getActiveDriversByAgency(@PathVariable Long agencyId) {
        List<Driver> drivers = driverService.getActiveDriversByAgency(agencyId);
        String message = drivers.isEmpty() ? "No active drivers found for this agency" : "Active agency drivers retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, drivers));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Driver>> updateDriver(@PathVariable Long id, @RequestBody Driver driver) {
        Driver updatedDriver = driverService.updateDriver(id, driver);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver updated successfully", updatedDriver));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@PathVariable Long id) {
        String newPassword = driverService.resetPassword(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully", newPassword));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver deleted successfully"));
    }
}