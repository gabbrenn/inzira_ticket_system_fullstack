package com.inzira.shared.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.inzira.shared.entities.Schedule;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDepartureDateAndStatus(LocalDate departureDate, String status);
    
    @Query("SELECT s FROM Schedule s WHERE s.agencyRoute.route.origin.id = :originId " +
           "AND s.agencyRoute.route.destination.id = :destinationId " +
           "AND s.departureDate = :departureDate AND s.status = :status")
    List<Schedule> findAvailableSchedules(@Param("originId") Long originId, 
                                        @Param("destinationId") Long destinationId,
                                        @Param("departureDate") LocalDate departureDate,
                                        @Param("status") String status);
    
    List<Schedule> findByBusIdAndDepartureDate(Long busId, LocalDate departureDate);
    List<Schedule> findByDriverIdAndDepartureDate(Long driverId, LocalDate departureDate);
    List<Schedule> findByAgencyRouteAgencyId(Long agencyId);
}