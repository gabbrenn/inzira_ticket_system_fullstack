package com.inzira.shared.dtos;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class BusDTO {
    private Long id;
    private String plateNumber;
    private String busType;
    private Integer capacity;
    private String status;
    private String agencyName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}