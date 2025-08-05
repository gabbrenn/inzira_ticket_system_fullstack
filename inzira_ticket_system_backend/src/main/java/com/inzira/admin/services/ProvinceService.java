package com.inzira.admin.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.shared.entities.Province;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.ProvinceRepository;

import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class ProvinceService {

    @Autowired
    private ProvinceRepository provinceRepository;

    public Province createProvince(Province province) {
        if (provinceRepository.existsByNameIgnoreCase(province.getName())) {
            throw new IllegalArgumentException("Province already exists");
        }
        return provinceRepository.save(province);
    }

    public List<Province> getAll() {
        return provinceRepository.findAll();
    }

    public Province getById(Long id) {
        return provinceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Province not found with ID: " + id));
    }

    public Optional<Province> getByName(String name) {
        return provinceRepository.findByNameIgnoreCase(name);
    }

    public Province updateProvince(Long id, Province updatedProvince) {
        Province existing = provinceRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Province not found with ID: " + id));

        // Check for duplicate by name
        if (!existing.getName().equalsIgnoreCase(updatedProvince.getName()) &&
            provinceRepository.existsByNameIgnoreCase(updatedProvince.getName())) {
            throw new IllegalArgumentException("Province with this name already exists");
        }

        existing.setName(updatedProvince.getName());
        existing.setDescription(updatedProvince.getDescription());
        return provinceRepository.save(existing);
    }

    public void deleteProvince(Long id) {
        Province province = provinceRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Province not found with ID: " + id));
        provinceRepository.delete(province);
    }
}