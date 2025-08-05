package com.inzira.shared.repositories;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inzira.shared.entities.District;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<District> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndProvinceId(String name, Long provinceId);
    List<District> findByProvinceId(Long provinceId);
    List<District> findByProvinceIdOrderByNameAsc(Long provinceId);
}