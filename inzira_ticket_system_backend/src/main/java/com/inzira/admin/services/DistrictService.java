package com.inzira.admin.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.shared.entities.District;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.DistrictRepository;

import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class DistrictService {

    @Autowired
    private DistrictRepository districtRepository;

    public District createDistrict(District district) {
        if (districtRepository.existsByNameIgnoreCase(district.getName())) {
            throw new IllegalArgumentException("District already exists");
        }
        return districtRepository.save(district);
    }

    public List<District> getAll() {
        return districtRepository.findAll();
    }

    public District getById(Long id) {
        return districtRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("District not found with ID: " + id));
    }

    public Optional<District> getByName(String name) {
        return districtRepository.findByNameIgnoreCase(name);
    }

    public District updateDistrict(Long id, District updatedDistrict) {
        District existing = districtRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("District not found with ID: " + id));

        // Optional: check for duplicate by name
        if (!existing.getName().equalsIgnoreCase(updatedDistrict.getName()) &&
            districtRepository.existsByNameIgnoreCase(updatedDistrict.getName())) {
            throw new IllegalArgumentException("District with this name already exists");
        }

        existing.setName(updatedDistrict.getName());
        return districtRepository.save(existing);
    }

    public void deleteDistrict(Long id) {
        District district = districtRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("District not found with ID: " + id));
        districtRepository.delete(district);
    }
}