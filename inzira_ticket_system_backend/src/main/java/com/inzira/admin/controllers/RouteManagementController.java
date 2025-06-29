package com.inzira.admin.controllers;

import com.inzira.admin.services.RouteManagementService;
import com.inzira.shared.entities.Route;
import com.inzira.shared.exceptions.ApiResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/routes")
public class RouteManagementController {

    @Autowired
    private RouteManagementService routeService;

    @PostMapping
    public ResponseEntity<ApiResponse<Route>> createRoute(@RequestBody Route route) {
        Route createdRoute = routeService.createRoute(route);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Route created successfully", createdRoute));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Route>>> getAllRoutes() {
        List<Route> routes = routeService.getAllRoutes();
        String message = routes.isEmpty() ? "No routes found" : "Routes retrieved successfully";
        return ResponseEntity.ok(new ApiResponse<>(true, message, routes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Route>> getRouteById(@PathVariable Long id) {
        Route route = routeService.getRouteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Route found", route));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Route>> updateRoute(@PathVariable Long id, @RequestBody Route route) {
        Route updatedRoute = routeService.updateRoute(id, route);
        return ResponseEntity.ok(new ApiResponse<>(true, "Route updated successfully", updatedRoute));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable Long id) {
        routeService.deleteRoute(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Route deleted successfully"));
    }
}