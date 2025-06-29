package com.inzira.shared.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inzira.admin.entities.Admin;
import com.inzira.admin.repositories.AdminRepository;
import com.inzira.agency.entities.Agency;
import com.inzira.agency.repositories.AgencyRepository;
import com.inzira.shared.dtos.LoginRequest;
import com.inzira.shared.dtos.LoginResponse;
import com.inzira.shared.dtos.RegisterRequest;
import com.inzira.shared.entities.Customer;
import com.inzira.shared.entities.User;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.CustomerRepository;
import com.inzira.shared.repositories.UserRepository;
import com.inzira.shared.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public User registerUser(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Validate role for self-registration
        if (!request.getRole().equals("ADMIN") && !request.getRole().equals("CUSTOMER")) {
            throw new IllegalArgumentException("Only ADMIN and CUSTOMER can self-register");
        }

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(User.UserRole.valueOf(request.getRole()));
        user.setStatus("ACTIVE");

        // Create role-specific entity
        Long roleEntityId = null;
        if (request.getRole().equals("ADMIN")) {
            Admin admin = new Admin();
            admin.setUsername(request.getEmail());
            admin.setEmail(request.getEmail());
            admin.setPhoneNumber(request.getPhoneNumber());
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
            admin = adminRepository.save(admin);
            roleEntityId = admin.getId();
        } else if (request.getRole().equals("CUSTOMER")) {
            Customer customer = new Customer();
            customer.setFirstName(request.getFirstName());
            customer.setLastName(request.getLastName());
            customer.setEmail(request.getEmail());
            customer.setPhoneNumber(request.getPhoneNumber());
            customer.setPassword(passwordEncoder.encode(request.getPassword()));
            customer.setStatus("ACTIVE");
            customer = customerRepository.save(customer);
            roleEntityId = customer.getId();
        }

        user.setRoleEntityId(roleEntityId);
        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmailAndStatus(request.getEmail(), "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId(),
                user.getRoleEntityId()
        );

        // Create response
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setRole(user.getRole().name());
        response.setUserId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setRoleEntityId(user.getRoleEntityId());

        return response;
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmailAndStatus(email, "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}