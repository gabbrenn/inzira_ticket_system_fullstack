package com.inzira.shared.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.shared.dtos.LoginRequest;
import com.inzira.shared.dtos.LoginResponse;
import com.inzira.shared.dtos.RegisterRequest;
import com.inzira.shared.entities.User;
import com.inzira.shared.exceptions.ApiResponse;
import com.inzira.shared.services.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody RegisterRequest request) {
        System.out.println("Registration request received for: " + request.getEmail());
        
        try {
            User user = authService.registerUser(request);
            System.out.println("Registration successful for: " + request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "User registered successfully", user));
        } catch (IllegalArgumentException e) {
            System.err.println("Registration validation error: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            System.err.println("Registration server error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Registration failed: " + e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        System.out.println("Login request received for: " + request.getEmail());
        
        try {
            LoginResponse response = authService.login(request);
            System.out.println("Login successful for: " + request.getEmail());
            return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
        } catch (IllegalArgumentException e) {
            System.err.println("Login validation error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            System.err.println("Login server error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Login failed: " + e.getMessage(), null));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        // This would be implemented with JWT token parsing
        // For now, return a placeholder response
        return ResponseEntity.ok(new ApiResponse<>(true, "User info retrieved", null));
    }
}