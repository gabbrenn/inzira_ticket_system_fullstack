package com.inzira.admin.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.shared.entities.District;
import com.inzira.shared.entities.Province;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.DistrictRepository;
import com.inzira.shared.repositories.ProvinceRepository;

import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class DistrictService {

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private ProvinceRepository provinceRepository;

    public District createDistrict(District district) {
        // Validate province exists
        Province province = provinceRepository.findById(district.getProvince().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Province not found"));

        // Check if district already exists in the same province
        if (districtRepository.existsByNameIgnoreCaseAndProvinceId(district.getName(), province.getId())) {
            throw new IllegalArgumentException("District already exists in this province");
        }
        
        district.setProvince(province);
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

        // Validate province if being changed
        if (updatedDistrict.getProvince() != null && 
            !existing.getProvince().getId().equals(updatedDistrict.getProvince().getId())) {
            Province newProvince = provinceRepository.findById(updatedDistrict.getProvince().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Province not found"));
            existing.setProvince(newProvince);
        }

        // Check for duplicate by name in the same province
        if (!existing.getName().equalsIgnoreCase(updatedDistrict.getName()) &&
            districtRepository.existsByNameIgnoreCaseAndProvinceId(
                updatedDistrict.getName(), existing.getProvince().getId())) {
            throw new IllegalArgumentException("District with this name already exists in this province");
        }

        existing.setName(updatedDistrict.getName());
        return districtRepository.save(existing);
    }

    public List<District> getDistrictsByProvince(Long provinceId) {
        return districtRepository.findByProvinceIdOrderByNameAsc(provinceId);
    }

    public void deleteDistrict(Long id) {
        District district = districtRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("District not found with ID: " + id));
        districtRepository.delete(district);
    }
}