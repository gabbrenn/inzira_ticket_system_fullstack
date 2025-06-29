package com.inzira.admin.controllers;

import com.inzira.admin.dtos.AgencyDTO;
import com.inzira.admin.dtos.AgencyRegistrationDTO;
import com.inzira.admin.dtos.AgencyUpdateDTO;
import com.inzira.admin.services.AgencyManagementService;
import com.inzira.admin.services.AgencyRegistrationService;
import com.inzira.shared.exceptions.ApiResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

@RestController
@RequestMapping("/api/admin/agencies")
@RequiredArgsConstructor
public class AgencyManagementController {

    private final AgencyManagementService agencyManagementService;
    private final AgencyRegistrationService agencyRegistrationService;
    private final ObjectMapper objectMapper;

    // ✅ Create agency
    @PostMapping
    public ResponseEntity<ApiResponse<AgencyDTO>> createAgency(
            @ModelAttribute AgencyRegistrationDTO registrationDTO,
            @RequestParam("image") MultipartFile image) {

        AgencyDTO createdAgency = agencyRegistrationService.createAgency(registrationDTO, image);
        setLogoFullUrl(createdAgency);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agency created successfully", createdAgency));
    }

    // ✅ Get all agencies
    @GetMapping
    public ResponseEntity<ApiResponse<List<AgencyDTO>>> getAllAgencies() {
        List<AgencyDTO> agencies = agencyManagementService.getAllAgencies();
        agencies.forEach(this::setLogoFullUrl);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agencies retrieved", agencies));
    }

    // ✅ Get agency by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AgencyDTO>> getAgencyById(@PathVariable Long id) {
        AgencyDTO agency = agencyManagementService.getAgencyById(id);
        setLogoFullUrl(agency);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agency found", agency));
    }

    // ✅ Update agency
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AgencyDTO>> updateAgency(
            @PathVariable Long id,
            @RequestPart("agency") String agencyJson,
            @RequestPart(value = "logo", required = false) MultipartFile logoFile) {

        try {
            // Parse the JSON string to AgencyUpdateDTO
            AgencyUpdateDTO updatedDto = objectMapper.readValue(agencyJson, AgencyUpdateDTO.class);
            
            AgencyDTO updatedAgency = agencyManagementService.updateAgency(id, updatedDto, logoFile);
            setLogoFullUrl(updatedAgency);
            return ResponseEntity.ok(new ApiResponse<>(true, "Agency updated successfully", updatedAgency));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Invalid agency data: " + e.getMessage()));
        }
    }

    // ✅ Reset password
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@PathVariable Long id) {
        String newPassword = agencyManagementService.resetPassword(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully", newPassword));
    }

    // ✅ Delete agency
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAgency(@PathVariable Long id) {
        agencyManagementService.deleteAgency(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agency deleted successfully"));
    }

    // 📌 Helper method to build full image URL
    private void setLogoFullUrl(AgencyDTO dto) {
        if (dto.getLogoPath() != null && !dto.getLogoPath().isBlank()) {
            String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
            dto.setLogoPath(baseUrl + "/uploads/" + dto.getLogoPath());
        }
    }
}