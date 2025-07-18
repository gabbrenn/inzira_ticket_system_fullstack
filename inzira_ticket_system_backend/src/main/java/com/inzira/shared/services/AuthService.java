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
import com.inzira.shared.entities.Driver;
import com.inzira.shared.entities.User;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.CustomerRepository;
import com.inzira.shared.repositories.DriverRepository;
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
    private DriverRepository driverRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public User registerUser(RegisterRequest request) {
        System.out.println("Starting registration for: " + request.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Validate role for self-registration
        if (!request.getRole().equals("ADMIN") && !request.getRole().equals("CUSTOMER")) {
            throw new IllegalArgumentException("Only ADMIN and CUSTOMER can self-register");
        }

        try {
            // Create role-specific entity first
            Long roleEntityId = null;
            if (request.getRole().equals("ADMIN")) {
                // Check if admin already exists
                if (adminRepository.findByEmail(request.getEmail()).isPresent()) {
                    throw new IllegalArgumentException("Admin with this email already exists");
                }
                
                Admin admin = new Admin();
                admin.setUsername(request.getEmail());
                admin.setEmail(request.getEmail());
                admin.setPhoneNumber(request.getPhoneNumber());
                admin.setPassword(passwordEncoder.encode(request.getPassword()));
                admin = adminRepository.save(admin);
                roleEntityId = admin.getId();
                System.out.println("Created admin with ID: " + roleEntityId);
                
            } else if (request.getRole().equals("CUSTOMER")) {
                // Check if customer already exists
                if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
                    throw new IllegalArgumentException("Customer with this email already exists");
                }
                
                Customer customer = new Customer();
                customer.setFirstName(request.getFirstName());
                customer.setLastName(request.getLastName());
                customer.setEmail(request.getEmail());
                customer.setPhoneNumber(request.getPhoneNumber());
                customer.setPassword(passwordEncoder.encode(request.getPassword()));
                customer.setStatus("ACTIVE");
                customer = customerRepository.save(customer);
                roleEntityId = customer.getId();
                System.out.println("Created customer with ID: " + roleEntityId);
            } else if (request.getRole().equals("BRANCH_MANAGER")) {
                throw new IllegalArgumentException("Branch managers cannot self-register. Contact your agency administrator.");
            }

            // Create user entity
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setRole(User.UserRole.valueOf(request.getRole()));
            user.setStatus("ACTIVE");
            user.setRoleEntityId(roleEntityId);
            
            User savedUser = userRepository.save(user);
            System.out.println("Created user with ID: " + savedUser.getId());
            
            return savedUser;
            
        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        }
    }

    public LoginResponse login(LoginRequest request) {
        System.out.println("Login attempt for email: " + request.getEmail());
        
        try {
            // Find user by email
            User user = userRepository.findByEmailAndStatus(request.getEmail(), "ACTIVE")
                    .orElseThrow(() -> {
                        System.out.println("User not found or inactive: " + request.getEmail());
                        return new IllegalArgumentException("Invalid email or password");
                    });

            System.out.println("Found user: " + user.getEmail() + " with role: " + user.getRole());

            // Verify password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                System.out.println("Password mismatch for user: " + request.getEmail());
                throw new IllegalArgumentException("Invalid email or password");
            }

            System.out.println("Password verified for user: " + request.getEmail());

            // Generate JWT token
            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getRole().name(),
                    user.getId(),
                    user.getRoleEntityId()
            );

            System.out.println("Generated token for user: " + request.getEmail());

            // Create response
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setRole(user.getRole().name());
            response.setUserId(user.getId());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setEmail(user.getEmail());
            response.setRoleEntityId(user.getRoleEntityId());

            System.out.println("Login successful for: " + request.getEmail());
            return response;
            
        } catch (IllegalArgumentException e) {
            System.err.println("Login failed: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected login error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Login failed due to server error", e);
        }
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmailAndStatus(email, "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}