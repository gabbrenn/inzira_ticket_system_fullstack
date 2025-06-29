package com.inzira.shared.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inzira.shared.entities.Bus;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
    List<Bus> findByAgencyId(Long agencyId);
    List<Bus> findByStatus(String status);
    boolean existsByPlateNumber(String plateNumber);
    List<Bus> findByAgencyIdAndStatus(Long agencyId, String status);
}