package com.inzira.admin.dtos;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AgencyDTO {
    private Long id;
    private String agencyName;
    private String email;
    private String phoneNumber;
    private String address;
    private String status;
    private String logoPath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
