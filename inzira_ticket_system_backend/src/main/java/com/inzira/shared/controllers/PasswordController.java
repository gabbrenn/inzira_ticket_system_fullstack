package com.inzira.shared.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.shared.dtos.ChangePasswordRequest;
import com.inzira.shared.exceptions.ApiResponse;
import com.inzira.shared.services.PasswordService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordController {

    @Autowired
    private PasswordService passwordService;

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            // Extract token from Authorization header
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            passwordService.changePassword(token, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new ApiResponse<>(false, "Failed to change password: " + e.getMessage(), null));
        }
    }
}