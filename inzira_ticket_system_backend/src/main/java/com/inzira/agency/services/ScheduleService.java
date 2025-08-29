package com.inzira.agency.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inzira.agency.entities.AgencyRoute;
import com.inzira.agency.repositories.AgencyRouteRepository;
import com.inzira.shared.entities.Bus;
import com.inzira.shared.entities.Driver;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.BusRepository;
import com.inzira.shared.repositories.DriverRepository;
import com.inzira.shared.repositories.ScheduleRepository;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private AgencyRouteRepository agencyRouteRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public Schedule createSchedule(Schedule schedule) {
        // Validate agency route exists
        AgencyRoute agencyRoute = agencyRouteRepository.findById(schedule.getAgencyRoute().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Agency route not found"));

        // Validate bus exists and is available
        Bus bus = busRepository.findById(schedule.getBus().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Bus not found"));

        if (!"ACTIVE".equals(bus.getStatus())) {
            throw new IllegalArgumentException("Bus is not active");
        }

        // Validate driver exists and is available
        Driver driver = driverRepository.findById(schedule.getDriver().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        if (!"ACTIVE".equals(driver.getStatus())) {
            throw new IllegalArgumentException("Driver is not active");
        }

        // Check if bus is already scheduled for the same date
        List<Schedule> busSchedules = scheduleRepository.findByBusIdAndDepartureDate(
            bus.getId(), schedule.getDepartureDate());
        if (!busSchedules.isEmpty()) {
            throw new IllegalArgumentException("Bus is already scheduled for this date");
        }

        // Check if driver is already scheduled for the same date
        List<Schedule> driverSchedules = scheduleRepository.findByDriverIdAndDepartureDate(
            driver.getId(), schedule.getDepartureDate());
        if (!driverSchedules.isEmpty()) {
            throw new IllegalArgumentException("Driver is already scheduled for this date");
        }

        schedule.setAgencyRoute(agencyRoute);
        schedule.setBus(bus);
        schedule.setDriver(driver);
        schedule.setAvailableSeats(bus.getCapacity()); // Initialize with bus capacity
        schedule.setStatus("SCHEDULED"); // Default status

        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public Schedule getScheduleById(Long id) {
        return scheduleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + id));
    }

    public List<Schedule> getSchedulesByAgency(Long agencyId) {
        return scheduleRepository.findByAgencyRouteAgencyId(agencyId);
    }

    public List<Schedule> searchSchedules(Long originId, Long destinationId, LocalDate departureDate) {
        return scheduleRepository.findAvailableSchedules(originId, destinationId, departureDate, "SCHEDULED", null);
    }

    public List<Schedule> searchSchedulesByAgency(Long originId, Long destinationId, LocalDate departureDate, Long agencyId) {
        return scheduleRepository.findAvailableSchedules(originId, destinationId, departureDate, "SCHEDULED", agencyId);
    }

    public Schedule updateSchedule(Long id, Schedule updatedSchedule) {
        Schedule existingSchedule = scheduleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + id));

        // Only allow updates if schedule is still in SCHEDULED status
        if (!"SCHEDULED".equals(existingSchedule.getStatus())) {
            throw new IllegalArgumentException("Cannot update schedule that is not in SCHEDULED status");
        }

        existingSchedule.setDepartureDate(updatedSchedule.getDepartureDate());
        existingSchedule.setDepartureTime(updatedSchedule.getDepartureTime());
        existingSchedule.setArrivalTime(updatedSchedule.getArrivalTime());

        return scheduleRepository.save(existingSchedule);
    }

    public void cancelSchedule(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + id));

        if (!"SCHEDULED".equals(schedule.getStatus())) {
            throw new IllegalArgumentException("Can only cancel scheduled trips");
        }

        schedule.setStatus("CANCELLED");
        scheduleRepository.save(schedule);
    }

    public void deleteSchedule(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + id));

        if (!"SCHEDULED".equals(schedule.getStatus()) && !"CANCELLED".equals(schedule.getStatus())) {
            throw new IllegalArgumentException("Cannot delete schedule that has departed or arrived");
        }

        // Business rule: do not allow delete if bookings exist
        long bookingCount = bookingRepository.countByScheduleId(id);
        if (bookingCount > 0) {
            throw new IllegalStateException("Cannot delete schedule because there are " + bookingCount + " booking(s) referencing it. Cancel the schedule instead.");
        }

        scheduleRepository.deleteById(id);
    }
}