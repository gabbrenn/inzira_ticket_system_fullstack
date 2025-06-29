package com.inzira.shared.dtos;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String role; // ADMIN or CUSTOMER for self-registration
}