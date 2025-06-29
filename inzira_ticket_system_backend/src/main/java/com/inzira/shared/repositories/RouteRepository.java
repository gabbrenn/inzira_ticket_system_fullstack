package com.inzira.shared.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inzira.shared.entities.Route;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long>{
    Optional<Route> findByOriginIdAndDestinationId(Long originDistrictId, Long destinationDistrictId);
    boolean existsByOriginIdAndDestinationId(Long originDistrictId, Long destinationDistrictId);
    
}
