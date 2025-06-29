package com.inzira.agency.services;

import com.inzira.agency.entities.Agency;
import com.inzira.agency.entities.AgencyRoute;
import com.inzira.agency.repositories.AgencyRepository;
import com.inzira.agency.repositories.AgencyRouteRepository;
import com.inzira.shared.entities.Route;
import com.inzira.shared.entities.RoutePoint;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.RoutePointRepository;
import com.inzira.shared.repositories.RouteRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AgencyRouteService {

    @Autowired
    private AgencyRouteRepository agencyRouteRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private RoutePointRepository routePointRepository;

    public AgencyRoute createAgencyRoute(Long agencyId, Long routeId, double price, List<Long> pickupPointIds, List<Long> dropPointIds) {
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new EntityNotFoundException("Agency not found with ID: " + agencyId));

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new EntityNotFoundException("Route not found with ID: " + routeId));

        List<RoutePoint> pickupPoints = routePointRepository.findAllById(pickupPointIds);
        if (pickupPoints.size() != pickupPointIds.size()) {
            throw new IllegalArgumentException("One or more pickup points not found");
        }

        List<RoutePoint> dropPoints = routePointRepository.findAllById(dropPointIds);
        if (dropPoints.size() != dropPointIds.size()) {
            throw new IllegalArgumentException("One or more drop points not found");
        }

        // Optional: Validate pickupPoints belong to route.originDistrict & dropPoints belong to route.destinationDistrict

        AgencyRoute agencyRoute = new AgencyRoute();
        agencyRoute.setAgency(agency);
        agencyRoute.setRoute(route);
        agencyRoute.setPrice(price);
        agencyRoute.setPickupPoints(pickupPoints);
        agencyRoute.setDropPoints(dropPoints);

        return agencyRouteRepository.save(agencyRoute);
    }

    public List<AgencyRoute> getAllAgencyRoutes() {
        return agencyRouteRepository.findAll();
    }

    public AgencyRoute getById(Long id) {
        return agencyRouteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agency route not found with ID: " + id));
    }

    public List<AgencyRoute> getRoutesByAgencyId(Long agencyId) {
        return agencyRouteRepository.findByAgencyId(agencyId);
    }

    public void delete(Long id) {
        if (!agencyRouteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Agency route not found with ID: " + id);
        }
        agencyRouteRepository.deleteById(id);
    }
}