package com.inzira.agency.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.inzira.agency.entities.AgencyRoute;

public interface AgencyRouteRepository extends JpaRepository<AgencyRoute, Long> {
    List<AgencyRoute> findByRouteId(Long routeId);
    List<AgencyRoute> findByRouteOriginIdAndRouteDestinationId(Long originDistrictId, Long destinationDistrictId);
    List<AgencyRoute> findByAgencyId(Long agencyId);
}
