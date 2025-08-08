package com.inzira.agency.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.inzira.agency.entities.Agency;
import com.inzira.agency.repositories.AgencyRepository;
import com.inzira.shared.entities.Driver;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.DriverRepository;
import com.inzira.shared.entities.User;
import com.inzira.shared.repositories.UserRepository;
import com.inzira.shared.utils.PasswordUtility;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private PasswordUtility passwordUtility;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    public Driver createDriver(Driver driver) {
        // Validate agency exists
        Agency agency = agencyRepository.findById(driver.getAgency().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Agency not found"));

        // Check for duplicate email
        if (driverRepository.existsByEmail(driver.getEmail())) {
            throw new IllegalArgumentException("Driver with email " + driver.getEmail() + " already exists");
        }

        // Check for duplicate license number
        if (driverRepository.existsByLicenseNumber(driver.getLicenseNumber())) {
            throw new IllegalArgumentException("Driver with license number " + driver.getLicenseNumber() + " already exists");
        }

        // Generate initial password
        String rawPassword = passwordUtility.generateInitialPassword(driver.getFirstName(), driver.getPhoneNumber());

        driver.setAgency(agency);
        driver.setStatus("ACTIVE"); // Default status
        Driver savedDriver = driverRepository.save(driver);

        // Create corresponding User entity for authentication
        User user = new User();
        user.setEmail(savedDriver.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setFirstName(savedDriver.getFirstName());
        user.setLastName(savedDriver.getLastName());
        user.setPhoneNumber(savedDriver.getPhoneNumber());
        user.setRole(User.UserRole.DRIVER);
        user.setStatus("ACTIVE");
        user.setRoleEntityId(savedDriver.getId());
        userRepository.save(user);

        // Update corresponding User entity
        userRepository.findByEmail(savedDriver.getEmail()).ifPresent(user -> {
            user.setFirstName(savedDriver.getFirstName());
            user.setLastName(savedDriver.getLastName());
            user.setPhoneNumber(savedDriver.getPhoneNumber());
            user.setStatus(savedDriver.getStatus());
            userRepository.save(user);
        });

        return savedDriver;
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));
    }

    public List<Driver> getDriversByAgency(Long agencyId) {
        return driverRepository.findByAgencyId(agencyId);
    }

    public List<Driver> getActiveDriversByAgency(Long agencyId) {
        return driverRepository.findByAgencyIdAndStatus(agencyId, "ACTIVE");
    }

    public Driver updateDriver(Long id, Driver updatedDriver) {
        Driver existingDriver = driverRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));

        // Check for duplicate email (excluding current driver)
        if (!existingDriver.getEmail().equals(updatedDriver.getEmail()) &&
            driverRepository.existsByEmail(updatedDriver.getEmail())) {
            throw new IllegalArgumentException("Driver with email " + updatedDriver.getEmail() + " already exists");
        }

        // Check for duplicate license number (excluding current driver)
        if (!existingDriver.getLicenseNumber().equals(updatedDriver.getLicenseNumber()) &&
            driverRepository.existsByLicenseNumber(updatedDriver.getLicenseNumber())) {
            throw new IllegalArgumentException("Driver with license number " + updatedDriver.getLicenseNumber() + " already exists");
        }

        existingDriver.setFirstName(updatedDriver.getFirstName());
        existingDriver.setLastName(updatedDriver.getLastName());
        existingDriver.setEmail(updatedDriver.getEmail());
        existingDriver.setPhoneNumber(updatedDriver.getPhoneNumber());
        existingDriver.setLicenseNumber(updatedDriver.getLicenseNumber());
        existingDriver.setStatus(updatedDriver.getStatus());

        return driverRepository.save(existingDriver);
    }

    public String resetPassword(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        String newPassword = passwordUtility.generateInitialPassword(driver.getFirstName(), driver.getPhoneNumber());


        // Also update the User entity
        userRepository.findByEmail(driver.getEmail()).ifPresent(user -> {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        });

        return newPassword;
    }

    public void deleteDriver(Long id) {
        Driver driver = driverRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));

        // Delete corresponding User entity
        userRepository.findByEmail(driver.getEmail()).ifPresent(user -> {
            userRepository.delete(user);
        });

        driverRepository.deleteById(id);
    }
}