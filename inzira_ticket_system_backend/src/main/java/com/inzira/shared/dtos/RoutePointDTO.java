package com.inzira.shared.dtos;

import lombok.Data;

@Data
public class RoutePointDTO {
    private Long id;
    private String name;
    private Double gpsLat;
    private Double gpsLong;
}
