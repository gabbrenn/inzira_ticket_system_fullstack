package com.inzira.shared.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inzira.shared.entities.RoutePoint;

import java.util.List;

@Repository
public interface RoutePointRepository extends JpaRepository<RoutePoint, Long> {
    boolean existsByNameIgnoreCaseAndDistrictId(String name, Long districtId);
    boolean existsByNameIgnoreCaseAndDistrictIdAndIdNot(String name, Long districtId, Long id);
    List<RoutePoint> findByDistrictId(Long districtId);
}
