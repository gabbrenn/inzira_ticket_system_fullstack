package com.inzira.driver.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.shared.entities.Driver;
import com.inzira.shared.exceptions.ApiResponse;
import com.inzira.shared.repositories.DriverRepository;
import com.inzira.shared.exceptions.ResourceNotFoundException;

@RestController
@RequestMapping("/api/driver/profile")
public class DriverProfileController {

    @Autowired
    private DriverRepository driverRepository;

    @GetMapping("/{driverId}")
    public ResponseEntity<ApiResponse<Driver>> getDriverProfile(@PathVariable Long driverId) {
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver profile retrieved", driver));
    }

    @PutMapping("/{driverId}")
    public ResponseEntity<ApiResponse<Driver>> updateDriverProfile(@PathVariable Long driverId, @RequestBody Driver driverData) {
        Driver existingDriver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        // Update only allowed fields
        existingDriver.setFirstName(driverData.getFirstName());
        existingDriver.setLastName(driverData.getLastName());
        existingDriver.setPhoneNumber(driverData.getPhoneNumber());

        Driver updatedDriver = driverRepository.save(existingDriver);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver profile updated successfully", updatedDriver));
    }
}