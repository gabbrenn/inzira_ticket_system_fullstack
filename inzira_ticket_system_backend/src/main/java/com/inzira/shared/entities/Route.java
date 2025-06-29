package com.inzira.shared.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "origin_id")
    private District origin;

    @ManyToOne(optional = false)
    @JoinColumn(name = "destination_id")
    private District destination;

    private double distanceKm;
}
