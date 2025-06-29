package com.inzira.agency.controllers;

import com.inzira.agency.dtos.AgencyRouteDTO;
import com.inzira.agency.entities.AgencyRoute;
import com.inzira.agency.mappers.AgencyRouteMapper;
import com.inzira.agency.services.AgencyRouteService;
import com.inzira.shared.exceptions.ApiResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agency/routes")
public class AgencyRouteController {

    @Autowired
    private AgencyRouteService agencyRouteService;

    @PostMapping
    public ResponseEntity<ApiResponse<AgencyRouteDTO>> createAgencyRoute(@RequestBody Map<String, Object> request) {
        Long agencyId = Long.valueOf(request.get("agencyId").toString());
        Long routeId = Long.valueOf(request.get("routeId").toString());
        double price = Double.parseDouble(request.get("price").toString());

        @SuppressWarnings("unchecked")
        List<Integer> pickupPointInts = (List<Integer>) request.get("pickupPointIds");
        List<Long> pickupPointIds = pickupPointInts.stream().map(Long::valueOf).toList();

        @SuppressWarnings("unchecked")
        List<Integer> dropPointInts = (List<Integer>) request.get("dropPointIds");
        List<Long> dropPointIds = dropPointInts.stream().map(Long::valueOf).toList();

        AgencyRoute agencyRoute = agencyRouteService.createAgencyRoute(agencyId, routeId, price, pickupPointIds, dropPointIds);
        AgencyRouteDTO dto = AgencyRouteMapper.toDTO(agencyRoute);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Agency route created successfully", dto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AgencyRouteDTO>>> getAllAgencyRoutes() {
        List<AgencyRoute> agencyRoutes = agencyRouteService.getAllAgencyRoutes();
        List<AgencyRouteDTO> dtoList = agencyRoutes.stream()
            .map(AgencyRouteMapper::toDTO)
            .toList();

        String message = dtoList.isEmpty() ? "No agency routes found" : "Agency routes retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, dtoList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AgencyRouteDTO>> getAgencyRouteById(@PathVariable Long id) {
        AgencyRoute agencyRoute = agencyRouteService.getById(id);
        AgencyRouteDTO dto = AgencyRouteMapper.toDTO(agencyRoute);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agency route found", dto));
    }

    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<ApiResponse<List<AgencyRouteDTO>>> getRoutesByAgency(@PathVariable Long agencyId) {
        List<AgencyRoute> routes = agencyRouteService.getRoutesByAgencyId(agencyId);
        List<AgencyRouteDTO> dtoList = routes.stream().map(AgencyRouteMapper::toDTO).toList();
        
        String message = dtoList.isEmpty() ? "No routes found for this agency" : "Agency routes retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, dtoList));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAgencyRoute(@PathVariable Long id) {
        agencyRouteService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Agency route deleted successfully"));
    }
}