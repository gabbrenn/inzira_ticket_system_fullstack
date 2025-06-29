package com.inzira.shared.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.Data;

@Data
public class ScheduleDTO {
    private Long id;
    private RouteDTO route;
    private String agencyName;
    private String busPlateNumber;
    private String driverName;
    private LocalDate departureDate;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private Integer availableSeats;
    private Double price;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}