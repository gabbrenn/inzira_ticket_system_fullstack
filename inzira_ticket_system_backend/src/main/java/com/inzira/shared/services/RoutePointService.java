package com.inzira.shared.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.shared.entities.RoutePoint;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.RoutePointRepository;

import jakarta.persistence.EntityNotFoundException;

import java.util.List;

/**
 * Service class for managing RoutePoint entities.
 * Handles business logic for creating, retrieving, updating, and deleting route points.
 */
@Service
public class RoutePointService {

    @Autowired
    private RoutePointRepository routePointRepository;

    /**
     * Creates a new RoutePoint if it doesn't already exist in the same district.
     *
     * @param routePoint the RoutePoint to be created
     * @return the saved RoutePoint
     * @throws IllegalArgumentException if a route point with the same name already exists in the district
     */
    public RoutePoint createLocation(RoutePoint routePoint) {
        Long districtId = routePoint.getDistrict().getId();
        String name = routePoint.getName();

        // Check if a route point with the same name already exists in the district
        if (routePointRepository.existsByNameIgnoreCaseAndDistrictId(name, districtId)) {
            throw new IllegalArgumentException("Route point already exists in the same district");
        }

        return routePointRepository.save(routePoint);
    }

    /**
     * Retrieves all route points from the database.
     *
     * @return a list of all route points
     */
    public List<RoutePoint> getAll() {
        return routePointRepository.findAll();
    }

    /**
     * Retrieves a route point by its ID.
     *
     * @param id the ID of the route point
     * @return the found RoutePoint
     * @throws ResourceNotFoundException if no route point is found with the given ID
     */
    public RoutePoint getById(Long id) {
        return routePointRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Route point not found with ID: " + id));
    }

    /**
     * Retrieves all route points that belong to a specific district.
     *
     * @param districtId the ID of the district
     * @return a list of route points in the given district
     */
    public List<RoutePoint> getByDistrict(Long districtId) {
        return routePointRepository.findByDistrictId(districtId);
    }

    /**
     * Updates an existing route point with new data.
     *
     * @param id the ID of the route point to update
     * @param updatedRoutePoint the new data to update the route point with
     * @return the updated RoutePoint
     * @throws EntityNotFoundException if the route point with the given ID does not exist
     * @throws IllegalArgumentException if a duplicate route point exists in the same district
     */
    public RoutePoint updateLocation(Long id, RoutePoint updatedRoutePoint) {
        RoutePoint existing = routePointRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Route point not found with ID: " + id));

        Long updatedDistrictId = updatedRoutePoint.getDistrict().getId();
        String updatedName = updatedRoutePoint.getName();

        // Check for duplicate name in the same district excluding the current route point
        boolean existsDuplicate = routePointRepository.existsByNameIgnoreCaseAndDistrictIdAndIdNot(
            updatedName,
            updatedDistrictId,
            id
        );

        if (existsDuplicate) {
            throw new IllegalArgumentException("Another route point with this name already exists in the same district");
        }

        // Update the existing route point with new values
        existing.setName(updatedName);
        existing.setGpsLat(updatedRoutePoint.getGpsLat());
        existing.setGpsLong(updatedRoutePoint.getGpsLong());
        existing.setDistrict(updatedRoutePoint.getDistrict());

        return routePointRepository.save(existing);
    }

    /**
     * Deletes a route point by its ID.
     *
     * @param id the ID of the route point to delete
     * @throws EntityNotFoundException if the route point with the given ID does not exist
     */
    public void deleteLocation(Long id) {
        RoutePoint routePoint = routePointRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Route point not found with ID: " + id));
        routePointRepository.delete(routePoint);
    }
}