package com.inzira.shared.dtos;

import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private String role;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private Long roleEntityId;
}