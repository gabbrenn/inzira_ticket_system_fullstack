package com.inzira.shared.dtos;

import lombok.Data;

@Data
public class RouteDTO {
    private Long id;
    private DistrictDTO origin;
    private DistrictDTO destination;
    private double distanceKm;
}
