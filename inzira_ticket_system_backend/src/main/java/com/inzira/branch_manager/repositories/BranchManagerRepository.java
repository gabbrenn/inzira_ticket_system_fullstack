package com.inzira.branch_manager.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inzira.branch_manager.entities.BranchManager;

@Repository
public interface BranchManagerRepository extends JpaRepository<BranchManager, Long> {
    List<BranchManager> findByAgencyId(Long agencyId);
    Optional<BranchManager> findByBranchOfficeId(Long branchOfficeId);
    List<BranchManager> findByAgencyIdAndStatus(Long agencyId, String status);
    boolean existsByEmail(String email);
    boolean existsByBranchOfficeId(Long branchOfficeId);
    Optional<BranchManager> findByEmail(String email);
}