package com.inzira.shared.dtos;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ProvinceDTO {
    private Long id;
    private String name;
    private String description;
    private List<DistrictDTO> districts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}