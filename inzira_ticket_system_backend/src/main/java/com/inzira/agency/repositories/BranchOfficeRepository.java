package com.inzira.agency.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inzira.agency.entities.BranchOffice;

@Repository
public interface BranchOfficeRepository extends JpaRepository<BranchOffice, Long> {
    List<BranchOffice> findByAgencyId(Long agencyId);
    List<BranchOffice> findByAgencyIdAndStatus(Long agencyId, String status);
    boolean existsByOfficeNameAndAgencyId(String officeName, Long agencyId);
}