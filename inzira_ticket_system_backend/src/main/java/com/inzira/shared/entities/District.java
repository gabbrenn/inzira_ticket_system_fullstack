package com.inzira.shared.entities;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
public class District {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Optional: Link to province or country in the future

    @OneToMany(mappedBy = "district")
     @JsonIgnore
    private List<RoutePoint> locations;
    
    public District() {}

}
