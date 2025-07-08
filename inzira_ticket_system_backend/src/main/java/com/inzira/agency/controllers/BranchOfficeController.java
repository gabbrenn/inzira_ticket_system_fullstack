package com.inzira.agency.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.agency.entities.BranchOffice;
import com.inzira.agency.services.BranchOfficeService;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/agency/branch-offices")
public class BranchOfficeController {

    @Autowired
    private BranchOfficeService branchOfficeService;

    @PostMapping
    public ResponseEntity<ApiResponse<BranchOffice>> createBranchOffice(@RequestBody BranchOffice branchOffice) {
        BranchOffice createdBranchOffice = branchOfficeService.createBranchOffice(branchOffice);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Branch office created successfully", createdBranchOffice));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BranchOffice>>> getAllBranchOffices() {
        List<BranchOffice> branchOffices = branchOfficeService.getAllBranchOffices();
        String message = branchOffices.isEmpty() ? "No branch offices found" : "Branch offices retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, branchOffices));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchOffice>> getBranchOfficeById(@PathVariable Long id) {
        BranchOffice branchOffice = branchOfficeService.getBranchOfficeById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Branch office found", branchOffice));
    }

    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<ApiResponse<List<BranchOffice>>> getBranchOfficesByAgency(@PathVariable Long agencyId) {
        List<BranchOffice> branchOffices = branchOfficeService.getBranchOfficesByAgency(agencyId);
        String message = branchOffices.isEmpty() ? "No branch offices found for this agency" : "Agency branch offices retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, branchOffices));
    }

    @GetMapping("/agency/{agencyId}/active")
    public ResponseEntity<ApiResponse<List<BranchOffice>>> getActiveBranchOfficesByAgency(@PathVariable Long agencyId) {
        List<BranchOffice> branchOffices = branchOfficeService.getActiveBranchOfficesByAgency(agencyId);
        String message = branchOffices.isEmpty() ? "No active branch offices found for this agency" : "Active agency branch offices retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, branchOffices));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchOffice>> updateBranchOffice(@PathVariable Long id, @RequestBody BranchOffice branchOffice) {
        BranchOffice updatedBranchOffice = branchOfficeService.updateBranchOffice(id, branchOffice);
        return ResponseEntity.ok(new ApiResponse<>(true, "Branch office updated successfully", updatedBranchOffice));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBranchOffice(@PathVariable Long id) {
        branchOfficeService.deleteBranchOffice(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Branch office deleted successfully"));
    }
}