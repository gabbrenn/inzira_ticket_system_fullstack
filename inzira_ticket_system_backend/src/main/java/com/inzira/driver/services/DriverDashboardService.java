package com.inzira.driver.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.shared.entities.Driver;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.DriverRepository;
import com.inzira.shared.repositories.ScheduleRepository;

@Service
public class DriverDashboardService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private DriverRepository driverRepository;

    public List<Schedule> getDriverSchedules(Long driverId) {
        // Validate driver exists
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        return scheduleRepository.findByDriverId(driverId);
    }

    public List<Schedule> getTodaySchedules(Long driverId) {
        // Validate driver exists
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        LocalDate today = LocalDate.now();
        return scheduleRepository.findByDriverIdAndDepartureDate(driverId, today);
    }

    public List<Schedule> getUpcomingSchedules(Long driverId) {
        // Validate driver exists
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        LocalDate today = LocalDate.now();
        return scheduleRepository.findByDriverId(driverId)
            .stream()
            .filter(schedule -> schedule.getDepartureDate().isAfter(today) || 
                              (schedule.getDepartureDate().equals(today) && "SCHEDULED".equals(schedule.getStatus())))
            .toList();
    }

    public List<Schedule> getSchedulesByDate(Long driverId, LocalDate date) {
        // Validate driver exists
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        return scheduleRepository.findByDriverIdAndDepartureDate(driverId, date);
    }
}