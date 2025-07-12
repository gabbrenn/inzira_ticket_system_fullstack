package com.inzira.branch_manager.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.inzira.agency.entities.Agency;
import com.inzira.agency.entities.BranchOffice;
import com.inzira.agency.repositories.AgencyRepository;
import com.inzira.agency.repositories.BranchOfficeRepository;
import com.inzira.branch_manager.entities.BranchManager;
import com.inzira.branch_manager.repositories.BranchManagerRepository;
import com.inzira.shared.entities.User;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.UserRepository;
import com.inzira.shared.utils.PasswordUtility;

@Service
public class BranchManagerService {

    @Autowired
    private BranchManagerRepository branchManagerRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private BranchOfficeRepository branchOfficeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordUtility passwordUtility;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public BranchManager createBranchManager(BranchManager branchManager) {
        // Validate agency exists
        Agency agency = agencyRepository.findById(branchManager.getAgency().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Agency not found"));

        // Validate branch office exists and belongs to the agency
        BranchOffice branchOffice = branchOfficeRepository.findById(branchManager.getBranchOffice().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Branch office not found"));

        if (!branchOffice.getAgency().getId().equals(agency.getId())) {
            throw new IllegalArgumentException("Branch office does not belong to the specified agency");
        }

        // Check if branch office already has a manager
        if (branchManagerRepository.existsByBranchOfficeId(branchOffice.getId())) {
            throw new IllegalArgumentException("Branch office already has a manager");
        }

        // Check for duplicate email
        if (branchManagerRepository.existsByEmail(branchManager.getEmail())) {
            throw new IllegalArgumentException("Branch manager with email " + branchManager.getEmail() + " already exists");
        }

        if (userRepository.existsByEmail(branchManager.getEmail())) {
            throw new IllegalArgumentException("User with email " + branchManager.getEmail() + " already exists");
        }

        // Generate initial password
        String rawPassword = passwordUtility.generateInitialPassword(branchManager.getFirstName(), branchManager.getPhoneNumber());
        branchManager.setPassword(passwordEncoder.encode(rawPassword));

        branchManager.setAgency(agency);
        branchManager.setBranchOffice(branchOffice);
        branchManager.setStatus("ACTIVE"); // Default status
        
        BranchManager savedBranchManager = branchManagerRepository.save(branchManager);

        // Create corresponding User entity for authentication
        User user = new User();
        user.setEmail(savedBranchManager.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setFirstName(savedBranchManager.getFirstName());
        user.setLastName(savedBranchManager.getLastName());
        user.setPhoneNumber(savedBranchManager.getPhoneNumber());
        user.setRole(User.UserRole.BRANCH_MANAGER);
        user.setStatus("ACTIVE");
        user.setRoleEntityId(savedBranchManager.getId());
        userRepository.save(user);

        return savedBranchManager;
    }

    public List<BranchManager> getAllBranchManagers() {
        return branchManagerRepository.findAll();
    }

    public BranchManager getBranchManagerById(Long id) {
        return branchManagerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Branch manager not found with ID: " + id));
    }

    public List<BranchManager> getBranchManagersByAgency(Long agencyId) {
        return branchManagerRepository.findByAgencyId(agencyId);
    }

    public BranchManager getBranchManagerByBranchOffice(Long branchOfficeId) {
        return branchManagerRepository.findByBranchOfficeId(branchOfficeId)
            .orElseThrow(() -> new ResourceNotFoundException("Branch manager not found for branch office: " + branchOfficeId));
    }

    public List<BranchManager> getActiveBranchManagersByAgency(Long agencyId) {
        return branchManagerRepository.findByAgencyIdAndStatus(agencyId, "ACTIVE");
    }

    public BranchManager updateBranchManager(Long id, BranchManager updatedBranchManager) {
        BranchManager existingBranchManager = branchManagerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Branch manager not found with ID: " + id));

        // Check for duplicate email (excluding current branch manager)
        if (!existingBranchManager.getEmail().equals(updatedBranchManager.getEmail()) &&
            branchManagerRepository.existsByEmail(updatedBranchManager.getEmail())) {
            throw new IllegalArgumentException("Branch manager with email " + updatedBranchManager.getEmail() + " already exists");
        }

        existingBranchManager.setFirstName(updatedBranchManager.getFirstName());
        existingBranchManager.setLastName(updatedBranchManager.getLastName());
        existingBranchManager.setEmail(updatedBranchManager.getEmail());
        existingBranchManager.setPhoneNumber(updatedBranchManager.getPhoneNumber());
        existingBranchManager.setStatus(updatedBranchManager.getStatus());

        BranchManager savedBranchManager = branchManagerRepository.save(existingBranchManager);

        // Update corresponding User entity
        userRepository.findByEmail(savedBranchManager.getEmail()).ifPresent(user -> {
            user.setFirstName(savedBranchManager.getFirstName());
            user.setLastName(savedBranchManager.getLastName());
            user.setPhoneNumber(savedBranchManager.getPhoneNumber());
            user.setStatus(savedBranchManager.getStatus());
            userRepository.save(user);
        });

        return savedBranchManager;
    }

    public String resetPassword(Long branchManagerId) {
        BranchManager branchManager = branchManagerRepository.findById(branchManagerId)
            .orElseThrow(() -> new ResourceNotFoundException("Branch manager not found"));

        String newPassword = passwordUtility.generateInitialPassword(branchManager.getFirstName(), branchManager.getPhoneNumber());
        branchManager.setPassword(passwordEncoder.encode(newPassword));

        branchManagerRepository.save(branchManager);

        // Also update the User entity
        userRepository.findByEmail(branchManager.getEmail()).ifPresent(user -> {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        });

        return newPassword;
    }

    public void deleteBranchManager(Long id) {
        BranchManager branchManager = branchManagerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Branch manager not found with ID: " + id));

        // Delete corresponding User entity
        userRepository.findByEmail(branchManager.getEmail()).ifPresent(user -> {
            userRepository.delete(user);
        });

        branchManagerRepository.deleteById(id);
    }
}