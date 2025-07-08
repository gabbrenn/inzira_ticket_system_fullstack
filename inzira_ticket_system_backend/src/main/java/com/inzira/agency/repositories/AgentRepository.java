package com.inzira.agency.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inzira.agency.entities.Agent;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {
    List<Agent> findByAgencyId(Long agencyId);
    List<Agent> findByBranchOfficeId(Long branchOfficeId);
    List<Agent> findByAgencyIdAndStatus(Long agencyId, String status);
    boolean existsByEmail(String email);
    Optional<Agent> findByEmail(String email);
}