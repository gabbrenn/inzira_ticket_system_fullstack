package com.inzira.shared.dtos;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DriverDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String licenseNumber;
    private String status;
    private String agencyName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}