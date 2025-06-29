package com.inzira.admin.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.inzira.admin.dtos.AgencyDTO;
import com.inzira.admin.dtos.AgencyRegistrationDTO;
import com.inzira.admin.services.AgencyRegistrationService;
import com.inzira.shared.exceptions.ApiResponse;

@RestController
@RequestMapping("/api/admin/agencies")
public class AgencyRegistrationController {

    @Autowired
    private AgencyRegistrationService agencyRegistrationService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AgencyDTO>> createAgency(
            @ModelAttribute AgencyRegistrationDTO agencyRegistrationDTO,
            @RequestPart("image") MultipartFile image) {

        AgencyDTO createdAgency = agencyRegistrationService.createAgency(agencyRegistrationDTO, image);

        // Build full image URL if logoPath is present
        if (createdAgency.getLogoPath() != null) {
            String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
            createdAgency.setLogoPath(baseUrl + "/uploads/" + createdAgency.getLogoPath());
        }

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Agency created successfully", createdAgency));
    }
}