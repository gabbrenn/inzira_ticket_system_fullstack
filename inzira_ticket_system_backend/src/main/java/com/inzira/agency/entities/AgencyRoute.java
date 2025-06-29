package com.inzira.agency.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

import com.inzira.shared.entities.Route;
import com.inzira.shared.entities.RoutePoint;

@Entity
@Data
public class AgencyRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Agency agency;

    @ManyToOne(optional = false)
    private Route route;

    private double price;

    @ManyToMany
    @JoinTable(
        name = "agency_route_pickup_points",
        joinColumns = @JoinColumn(name = "agency_route_id"),
        inverseJoinColumns = @JoinColumn(name = "route_point_id")
    )
    private List<RoutePoint> pickupPoints;

    @ManyToMany
    @JoinTable(
        name = "agency_route_drop_points",
        joinColumns = @JoinColumn(name = "agency_route_id"),
        inverseJoinColumns = @JoinColumn(name = "route_point_id")
    )
    private List<RoutePoint> dropPoints;
}
