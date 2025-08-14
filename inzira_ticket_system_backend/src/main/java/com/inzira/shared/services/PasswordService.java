package com.inzira.shared.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inzira.admin.entities.Admin;
import com.inzira.admin.repositories.AdminRepository;
import com.inzira.agency.entities.Agency;
import com.inzira.agency.entities.Agent;
import com.inzira.agency.repositories.AgencyRepository;
import com.inzira.agency.repositories.AgentRepository;
import com.inzira.branch_manager.entities.BranchManager;
import com.inzira.branch_manager.repositories.BranchManagerRepository;
import com.inzira.shared.dtos.ChangePasswordRequest;
import com.inzira.shared.entities.Customer;
import com.inzira.shared.entities.Driver;
import com.inzira.shared.entities.User;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.CustomerRepository;
import com.inzira.shared.repositories.DriverRepository;
import com.inzira.shared.repositories.UserRepository;
import com.inzira.shared.security.JwtUtil;

@Service
public class PasswordService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private BranchManagerRepository branchManagerRepository;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public void changePassword(String token, ChangePasswordRequest request) {
        // Extract user info from token
        String email = jwtUtil.getEmailFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);
        Long roleEntityId = jwtUtil.getRoleEntityIdFromToken(token);

        // Find the user
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Validate new password
        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        // Encode new password
        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());

        // Update password in User table
        user.setPassword(encodedNewPassword);
        userRepository.save(user);

        // Update password in role-specific table
        switch (User.UserRole.valueOf(role)) {
            case ADMIN:
                Admin admin = adminRepository.findById(roleEntityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
                admin.setPassword(encodedNewPassword);
                adminRepository.save(admin);
                break;

            case AGENCY:
                Agency agency = agencyRepository.findById(roleEntityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Agency not found"));
                agency.setPassword(encodedNewPassword);
                agencyRepository.save(agency);
                break;

            case CUSTOMER:
                Customer customer = customerRepository.findById(roleEntityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
                customer.setPassword(encodedNewPassword);
                customerRepository.save(customer);
                break;

            case DRIVER:
                Driver driver = driverRepository.findById(roleEntityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
                driver.setPassword(encodedNewPassword);
                driverRepository.save(driver);
                break;

            case BRANCH_MANAGER:
                BranchManager branchManager = branchManagerRepository.findById(roleEntityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Branch manager not found"));
                branchManager.setPassword(encodedNewPassword);
                branchManagerRepository.save(branchManager);
                break;

            case AGENT:
                Agent agent = agentRepository.findById(roleEntityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));
                agent.setPassword(encodedNewPassword);
                agentRepository.save(agent);
                break;

            default:
                throw new IllegalArgumentException("Unsupported user role: " + role);
        }
    }
}