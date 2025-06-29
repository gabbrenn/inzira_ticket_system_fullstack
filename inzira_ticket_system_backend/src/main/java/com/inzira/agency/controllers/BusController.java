package com.inzira.agency.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.agency.services.BusService;
import com.inzira.shared.entities.Bus;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/agency/buses")
public class BusController {

    @Autowired
    private BusService busService;

    @PostMapping
    public ResponseEntity<ApiResponse<Bus>> createBus(@RequestBody Bus bus) {
        Bus createdBus = busService.createBus(bus);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Bus created successfully", createdBus));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Bus>>> getAllBuses() {
        List<Bus> buses = busService.getAllBuses();
        String message = buses.isEmpty() ? "No buses found" : "Buses retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, buses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Bus>> getBusById(@PathVariable Long id) {
        Bus bus = busService.getBusById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Bus found", bus));
    }

    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<ApiResponse<List<Bus>>> getBusesByAgency(@PathVariable Long agencyId) {
        List<Bus> buses = busService.getBusesByAgency(agencyId);
        String message = buses.isEmpty() ? "No buses found for this agency" : "Agency buses retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, buses));
    }

    @GetMapping("/agency/{agencyId}/active")
    public ResponseEntity<ApiResponse<List<Bus>>> getActiveBusesByAgency(@PathVariable Long agencyId) {
        List<Bus> buses = busService.getActiveBusesByAgency(agencyId);
        String message = buses.isEmpty() ? "No active buses found for this agency" : "Active agency buses retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, buses));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Bus>> updateBus(@PathVariable Long id, @RequestBody Bus bus) {
        Bus updatedBus = busService.updateBus(id, bus);
        return ResponseEntity.ok(new ApiResponse<>(true, "Bus updated successfully", updatedBus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBus(@PathVariable Long id) {
        busService.deleteBus(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Bus deleted successfully"));
    }
}