package com.inzira.agency.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.agency.entities.Agency;
import com.inzira.agency.repositories.AgencyRepository;
import com.inzira.shared.entities.Bus;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.BusRepository;

@Service
public class BusService {

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    public Bus createBus(Bus bus) {
        // Validate agency exists
        Agency agency = agencyRepository.findById(bus.getAgency().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Agency not found"));

        // Check for duplicate plate number
        if (busRepository.existsByPlateNumber(bus.getPlateNumber())) {
            throw new IllegalArgumentException("Bus with plate number " + bus.getPlateNumber() + " already exists");
        }

        bus.setAgency(agency);
        bus.setStatus("ACTIVE"); // Default status
        return busRepository.save(bus);
    }

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    public Bus getBusById(Long id) {
        return busRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bus not found with ID: " + id));
    }

    public List<Bus> getBusesByAgency(Long agencyId) {
        return busRepository.findByAgencyId(agencyId);
    }

    public List<Bus> getActiveBusesByAgency(Long agencyId) {
        return busRepository.findByAgencyIdAndStatus(agencyId, "ACTIVE");
    }

    public Bus updateBus(Long id, Bus updatedBus) {
        Bus existingBus = busRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bus not found with ID: " + id));

        // Check for duplicate plate number (excluding current bus)
        if (!existingBus.getPlateNumber().equals(updatedBus.getPlateNumber()) &&
            busRepository.existsByPlateNumber(updatedBus.getPlateNumber())) {
            throw new IllegalArgumentException("Bus with plate number " + updatedBus.getPlateNumber() + " already exists");
        }

        existingBus.setPlateNumber(updatedBus.getPlateNumber());
        existingBus.setBusType(updatedBus.getBusType());
        existingBus.setCapacity(updatedBus.getCapacity());
        existingBus.setStatus(updatedBus.getStatus());

        return busRepository.save(existingBus);
    }

    public void deleteBus(Long id) {
        if (!busRepository.existsById(id)) {
            throw new ResourceNotFoundException("Bus not found with ID: " + id);
        }
        busRepository.deleteById(id);
    }
}