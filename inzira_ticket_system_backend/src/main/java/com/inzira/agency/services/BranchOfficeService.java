package com.inzira.agency.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.agency.entities.Agency;
import com.inzira.agency.entities.BranchOffice;
import com.inzira.agency.repositories.AgencyRepository;
import com.inzira.agency.repositories.BranchOfficeRepository;
import com.inzira.shared.exceptions.ResourceNotFoundException;

@Service
public class BranchOfficeService {

    @Autowired
    private BranchOfficeRepository branchOfficeRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    public BranchOffice createBranchOffice(BranchOffice branchOffice) {
        // Validate agency exists
        Agency agency = agencyRepository.findById(branchOffice.getAgency().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Agency not found"));

        // Check for duplicate office name within the same agency
        if (branchOfficeRepository.existsByOfficeNameAndAgencyId(
                branchOffice.getOfficeName(), agency.getId())) {
            throw new IllegalArgumentException("Branch office with this name already exists in the agency");
        }

        branchOffice.setAgency(agency);
        branchOffice.setStatus("ACTIVE"); // Default status
        return branchOfficeRepository.save(branchOffice);
    }

    public List<BranchOffice> getAllBranchOffices() {
        return branchOfficeRepository.findAll();
    }

    public BranchOffice getBranchOfficeById(Long id) {
        return branchOfficeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Branch office not found with ID: " + id));
    }

    public List<BranchOffice> getBranchOfficesByAgency(Long agencyId) {
        return branchOfficeRepository.findByAgencyId(agencyId);
    }

    public List<BranchOffice> getActiveBranchOfficesByAgency(Long agencyId) {
        return branchOfficeRepository.findByAgencyIdAndStatus(agencyId, "ACTIVE");
    }

    public BranchOffice updateBranchOffice(Long id, BranchOffice updatedBranchOffice) {
        BranchOffice existingBranchOffice = branchOfficeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Branch office not found with ID: " + id));

        // Check for duplicate office name (excluding current office)
        if (!existingBranchOffice.getOfficeName().equals(updatedBranchOffice.getOfficeName()) &&
            branchOfficeRepository.existsByOfficeNameAndAgencyId(
                updatedBranchOffice.getOfficeName(), existingBranchOffice.getAgency().getId())) {
            throw new IllegalArgumentException("Branch office with this name already exists in the agency");
        }

        existingBranchOffice.setOfficeName(updatedBranchOffice.getOfficeName());
        existingBranchOffice.setAddress(updatedBranchOffice.getAddress());
        existingBranchOffice.setPhoneNumber(updatedBranchOffice.getPhoneNumber());
        existingBranchOffice.setEmail(updatedBranchOffice.getEmail());
        existingBranchOffice.setStatus(updatedBranchOffice.getStatus());

        return branchOfficeRepository.save(existingBranchOffice);
    }

    public void deleteBranchOffice(Long id) {
        if (!branchOfficeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Branch office not found with ID: " + id);
        }
        branchOfficeRepository.deleteById(id);
    }
}