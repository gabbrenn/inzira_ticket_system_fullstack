package com.inzira.branch_manager.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.branch_manager.entities.BranchManager;
import com.inzira.branch_manager.services.BranchManagerService;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/agency/branch-managers")
public class BranchManagerController {

    @Autowired
    private BranchManagerService branchManagerService;

    @PostMapping
    public ResponseEntity<ApiResponse<BranchManager>> createBranchManager(@RequestBody BranchManager branchManager) {
        BranchManager createdBranchManager = branchManagerService.createBranchManager(branchManager);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Branch manager created successfully", createdBranchManager));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BranchManager>>> getAllBranchManagers() {
        List<BranchManager> branchManagers = branchManagerService.getAllBranchManagers();
        String message = branchManagers.isEmpty() ? "No branch managers found" : "Branch managers retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, branchManagers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchManager>> getBranchManagerById(@PathVariable Long id) {
        BranchManager branchManager = branchManagerService.getBranchManagerById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Branch manager found", branchManager));
    }

    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<ApiResponse<List<BranchManager>>> getBranchManagersByAgency(@PathVariable Long agencyId) {
        List<BranchManager> branchManagers = branchManagerService.getBranchManagersByAgency(agencyId);
        String message = branchManagers.isEmpty() ? "No branch managers found for this agency" : "Agency branch managers retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, branchManagers));
    }

    @GetMapping("/branch-office/{branchOfficeId}")
    public ResponseEntity<ApiResponse<BranchManager>> getBranchManagerByBranchOffice(@PathVariable Long branchOfficeId) {
        BranchManager branchManager = branchManagerService.getBranchManagerByBranchOffice(branchOfficeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Branch manager found", branchManager));
    }

    @GetMapping("/agency/{agencyId}/active")
    public ResponseEntity<ApiResponse<List<BranchManager>>> getActiveBranchManagersByAgency(@PathVariable Long agencyId) {
        List<BranchManager> branchManagers = branchManagerService.getActiveBranchManagersByAgency(agencyId);
        String message = branchManagers.isEmpty() ? "No active branch managers found for this agency" : "Active agency branch managers retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, branchManagers));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchManager>> updateBranchManager(@PathVariable Long id, @RequestBody BranchManager branchManager) {
        BranchManager updatedBranchManager = branchManagerService.updateBranchManager(id, branchManager);
        return ResponseEntity.ok(new ApiResponse<>(true, "Branch manager updated successfully", updatedBranchManager));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@PathVariable Long id) {
        String newPassword = branchManagerService.resetPassword(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully", newPassword));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBranchManager(@PathVariable Long id) {
        branchManagerService.deleteBranchManager(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Branch manager deleted successfully"));
    }
}