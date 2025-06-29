package com.inzira.shared.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inzira.shared.entities.Driver;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    List<Driver> findByAgencyId(Long agencyId);
    List<Driver> findByStatus(String status);
    boolean existsByEmail(String email);
    boolean existsByLicenseNumber(String licenseNumber);
    Optional<Driver> findByEmail(String email);
    List<Driver> findByAgencyIdAndStatus(Long agencyId, String status);
}