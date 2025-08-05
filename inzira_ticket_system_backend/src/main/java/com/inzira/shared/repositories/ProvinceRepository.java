package com.inzira.shared.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inzira.shared.entities.Province;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Province> findByNameIgnoreCase(String name);
}