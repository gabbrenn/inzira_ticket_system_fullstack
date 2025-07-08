package com.inzira.agency.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inzira.admin.dtos.AgencyDTO;
import com.inzira.admin.dtos.AgencyUpdateDTO;
import com.inzira.admin.services.AgencyManagementService;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/agency/profile")
public class AgencyProfileController {

    @Autowired
    private AgencyManagementService agencyManagementService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/{agencyId}")
    public ResponseEntity<ApiResponse<AgencyDTO>> getAgencyProfile(@PathVariable Long agencyId) {
        AgencyDTO agency = agencyManagementService.getAgencyById(agencyId);
        setLogoFullUrl(agency);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agency profile retrieved", agency));
    }

    @PutMapping("/{agencyId}")
    public ResponseEntity<ApiResponse<AgencyDTO>> updateAgencyProfile(
            @PathVariable Long agencyId,
            @RequestPart("agency") String agencyJson,
            @RequestPart(value = "logo", required = false) MultipartFile logoFile) {

        try {
            // Parse the JSON string to AgencyUpdateDTO
            AgencyUpdateDTO updatedDto = objectMapper.readValue(agencyJson, AgencyUpdateDTO.class);
            
            AgencyDTO updatedAgency = agencyManagementService.updateAgency(agencyId, updatedDto, logoFile);
            setLogoFullUrl(updatedAgency);
            return ResponseEntity.ok(new ApiResponse<>(true, "Agency profile updated successfully", updatedAgency));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Invalid agency data: " + e.getMessage()));
        }
    }

    // Helper method to build full image URL
    private void setLogoFullUrl(AgencyDTO dto) {
        if (dto.getLogoPath() != null && !dto.getLogoPath().isBlank()) {
            String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
            dto.setLogoPath(baseUrl + "/uploads/" + dto.getLogoPath());
        }
    }
}