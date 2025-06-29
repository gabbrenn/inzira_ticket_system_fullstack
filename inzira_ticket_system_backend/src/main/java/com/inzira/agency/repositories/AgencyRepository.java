package com.inzira.agency.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inzira.agency.entities.Agency;

@Repository
public interface AgencyRepository extends JpaRepository<Agency, Long> {
    Optional<Agency> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByAgencyName(String agencyName);
}
