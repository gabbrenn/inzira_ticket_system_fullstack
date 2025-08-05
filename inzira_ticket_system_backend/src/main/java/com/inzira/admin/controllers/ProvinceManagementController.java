package com.inzira.admin.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.admin.services.ProvinceService;
import com.inzira.admin.services.DistrictService;
import com.inzira.shared.entities.Province;
import com.inzira.shared.entities.District;
import com.inzira.shared.exceptions.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin/provinces")
public class ProvinceManagementController {

    @Autowired
    private ProvinceService provinceService;

    @Autowired
    private DistrictService districtService;

    // Create Province
    @PostMapping
    public ResponseEntity<ApiResponse<Province>> createProvince(@RequestBody Province province) {
        Province createdProvince = provinceService.createProvince(province);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Province created successfully", createdProvince));
    }

    // Get All Provinces
    @GetMapping
    public ResponseEntity<ApiResponse<List<Province>>> getAllProvinces() {
        List<Province> provinces = provinceService.getAll();
        String message = provinces.isEmpty() ? "No provinces found" : "Provinces retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, provinces));
    }

    // Get Province by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Province>> getProvinceById(@PathVariable Long id) {
        Province province = provinceService.getById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Province found", province));
    }

    // Update Province
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Province>> updateProvince(
            @PathVariable Long id, 
            @RequestBody Province province) {
        Province updatedProvince = provinceService.updateProvince(id, province);
        return ResponseEntity.ok(new ApiResponse<>(true, "Province updated successfully", updatedProvince));
    }

    // Delete Province
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProvince(@PathVariable Long id) {
        provinceService.deleteProvince(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Province deleted successfully"));
    }

    // Get Districts by Province
    @GetMapping("/{provinceId}/districts")
    public ResponseEntity<ApiResponse<List<District>>> getDistrictsByProvince(@PathVariable Long provinceId) {
        // Validate province exists
        provinceService.getById(provinceId);
        
        List<District> districts = districtService.getDistrictsByProvince(provinceId);
        String message = districts.isEmpty() ? "No districts found in this province" : "Districts retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, districts));
    }
}