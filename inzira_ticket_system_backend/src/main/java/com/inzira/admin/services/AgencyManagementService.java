package com.inzira.admin.services;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.inzira.admin.dtos.AgencyDTO;
import com.inzira.admin.dtos.AgencyUpdateDTO;
import com.inzira.admin.mappers.AgencyMapper;
import com.inzira.agency.entities.Agency;
import com.inzira.agency.repositories.AgencyRepository;
import com.inzira.shared.entities.User;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.UserRepository;
import com.inzira.shared.services.FileStorageService;
import com.inzira.shared.utils.PasswordUtility;

@Service
public class AgencyManagementService {

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private PasswordUtility passwordUtility;

    @Autowired
    private AgencyMapper agencyMapper;
    
    // Get all agencies as DTOs
    public List<AgencyDTO> getAllAgencies() {
        return agencyRepository.findAll()
                .stream()
                .map(agencyMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Get agency by ID as DTO with error handling
    public AgencyDTO getAgencyById(Long id) {
        Agency agency = agencyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Agency with ID " + id + " not found"));
        return agencyMapper.toDTO(agency);
    }

    // Update agency by ID using DTO + optional MultipartFile
    public AgencyDTO updateAgency(Long id, AgencyUpdateDTO dto, MultipartFile logoFile) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agency with ID " + id + " not found"));

        // Store current logo path before updating
        String currentLogoPath = agency.getLogoPath();

        // Update agency fields from DTO
        agencyMapper.updateEntityFromDTO(dto, agency);

        // Handle optional logo - only update if new file is provided
        if (logoFile != null && !logoFile.isEmpty()) {
            handleLogoUpdate(agency, logoFile);
        } else {
            // Keep existing logo if no new file is provided
            agency.setLogoPath(currentLogoPath);
        }

        Agency saved = agencyRepository.save(agency);
        return agencyMapper.toDTO(saved);
    }

    // Reset agency password and return new raw password (handle email sending outside)
    public String resetPassword(Long agencyId) {
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new ResourceNotFoundException("Agency not found"));

        String newPassword = passwordUtility.generateInitialPassword(agency.getAgencyName(), agency.getPhoneNumber());
        agency.setPassword(passwordUtility.encodePassword(newPassword));

        agencyRepository.save(agency);

        // Also update the User entity if it exists
        userRepository.findByEmail(agency.getEmail()).ifPresent(user -> {
            user.setPassword(passwordUtility.encodePassword(newPassword));
            userRepository.save(user);
        });

        return newPassword;
    }

    // Delete agency and delete logo file
    public void deleteAgency(Long id) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agency not found"));

        deleteLogoIfExists(agency.getLogoPath());

        // Also delete the User entity if it exists
        userRepository.findByEmail(agency.getEmail()).ifPresent(user -> {
            userRepository.delete(user);
        });

        agencyRepository.deleteById(id);
    }

     // 🔧 Utility: Handle logo replacement
    private void handleLogoUpdate(Agency agency, MultipartFile logoFile) {
        try {
            // Delete old logo before storing new one
            deleteLogoIfExists(agency.getLogoPath());
            String newLogoPath = fileStorageService.storeFile(logoFile, "user-profile");
            agency.setLogoPath(newLogoPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store logo during update", e);
        }
    }

    // 🔧 Utility: Delete logo file if it exists
    private void deleteLogoIfExists(String logoPath) {
        if (logoPath != null && !logoPath.isBlank()) {
            // Extract just the filename from the full URL path
            String fileName = logoPath;
            if (logoPath.contains("/uploads/")) {
                fileName = logoPath.substring(logoPath.lastIndexOf("/uploads/") + 9);
            }
            Path fullPath = Paths.get("uploads").resolve(fileName);
            File file = fullPath.toFile();
            if (file.exists()) {
                boolean deleted = file.delete();
                if (deleted) {
                    System.out.println("Successfully deleted old logo: " + fileName);
                } else {
                    System.err.println("Failed to delete old logo: " + fileName);
                }
            }
        }
    }
}