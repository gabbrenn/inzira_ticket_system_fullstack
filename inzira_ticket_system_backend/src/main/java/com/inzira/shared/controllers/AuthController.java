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
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody RegisterRequest request) {
        User user = authService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "User registered successfully", user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        // This would be implemented with JWT token parsing
        // For now, return a placeholder response
        return ResponseEntity.ok(new ApiResponse<>(true, "User info retrieved", null));
    }
}