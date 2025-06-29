package com.inzira.agency.dtos;

import lombok.Data;
import java.util.List;

import com.inzira.shared.dtos.RouteDTO;
import com.inzira.shared.dtos.RoutePointDTO;

@Data
public class AgencyRouteDTO {
    private Long id;
    private AgencyDTO agency;
    private RouteDTO route;
    private double price;
    private List<RoutePointDTO> pickupPoints;
    private List<RoutePointDTO> dropPoints;
}
