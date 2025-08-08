package com.inzira.admin.services;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.inzira.admin.entities.Admin;
import com.inzira.admin.repositories.AdminRepository;
import com.inzira.shared.entities.User;
import com.inzira.shared.repositories.UserRepository;

@Service
public class AdminService {
    
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    public Admin registerAdmin(Admin admin) {
        String originalPassword = admin.getPassword();
        
        // Check if the email is already registered
        Optional<Admin> existingAdmin = adminRepository.findByEmail(admin.getEmail());
        if (existingAdmin.isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Admin savedAdmin = adminRepository.save(admin);

        // Create corresponding User entity for authentication
        User user = new User();
        user.setEmail(savedAdmin.getEmail());
        user.setPassword(passwordEncoder.encode(originalPassword));
        user.setFirstName(savedAdmin.getUsername());
        user.setLastName("Admin");
        user.setPhoneNumber(savedAdmin.getPhoneNumber());
        user.setRole(User.UserRole.ADMIN);
        user.setStatus("ACTIVE");
        user.setRoleEntityId(savedAdmin.getId());
        userRepository.save(user);

        return savedAdmin;
    }
}