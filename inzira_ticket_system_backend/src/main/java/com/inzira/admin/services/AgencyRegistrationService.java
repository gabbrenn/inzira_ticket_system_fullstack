package com.inzira.admin.services;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.inzira.agency.entities.Agency;
import com.inzira.agency.repositories.AgencyRepository;
import com.inzira.admin.dtos.AgencyRegistrationDTO;
import com.inzira.admin.dtos.AgencyDTO;
import com.inzira.admin.mappers.AgencyMapper;
import com.inzira.shared.entities.User;
import com.inzira.shared.repositories.UserRepository;
import com.inzira.shared.services.FileStorageService;
import com.inzira.shared.utils.PasswordUtility;

@Service
public class AgencyRegistrationService {

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

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Create new agency from DTO + MultipartFile
    @Transactional
    public AgencyDTO createAgency(AgencyRegistrationDTO registrationDTO, MultipartFile file) {
        try {
            // Validate uniqueness
            if (agencyRepository.existsByEmail(registrationDTO.getEmail())) {
                throw new IllegalArgumentException("Agency with email " + registrationDTO.getEmail() + " already exists");
            }
            if (agencyRepository.existsByAgencyName(registrationDTO.getAgencyName())) {
                throw new IllegalArgumentException("Agency with name " + registrationDTO.getAgencyName() + " already exists");
            }
            if (userRepository.existsByEmail(registrationDTO.getEmail())) {
                throw new IllegalArgumentException("User with email " + registrationDTO.getEmail() + " already exists");
            }
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Uploaded file is empty or missing");
            }

            // Map DTO to Entity
            Agency agency = agencyMapper.toEntity(registrationDTO);

            // Generate and encode password
            String rawPassword;
            if (registrationDTO.getPassword() != null && !registrationDTO.getPassword().trim().isEmpty()) {
                rawPassword = registrationDTO.getPassword();
            } else {
                rawPassword = passwordUtility.generateInitialPassword(registrationDTO.getAgencyName(), registrationDTO.getPhoneNumber());
            }
            agency.setPassword(passwordUtility.encodePassword(rawPassword));

            // Store file and set path
            String filePath = fileStorageService.storeFile(file, "user-profile");
            agency.setLogoPath(filePath);

            // Save to DB
            Agency savedAgency = agencyRepository.save(agency);

            // Create corresponding User entity for authentication
            User user = new User();
            user.setEmail(savedAgency.getEmail());
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setFirstName(savedAgency.getAgencyName());
            user.setLastName("Agency");
            user.setPhoneNumber(savedAgency.getPhoneNumber());
            user.setRole(User.UserRole.AGENCY);
            user.setStatus("ACTIVE");
            user.setRoleEntityId(savedAgency.getId());
            userRepository.save(user);

            // Map saved entity to DTO and return
            return agencyMapper.toDTO(savedAgency);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store logo file: " + e.getMessage(), e);
        } catch (DataAccessException e) {
            throw new RuntimeException("Database error while saving agency: " + e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error while creating agency: " + e.getMessage(), e);
        }
    }
}