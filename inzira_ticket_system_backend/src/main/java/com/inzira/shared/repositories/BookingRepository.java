package com.inzira.shared.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inzira.shared.entities.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);
    List<Booking> findByScheduleId(Long scheduleId);
    Optional<Booking> findByBookingReference(String bookingReference);
    List<Booking> findByStatus(String status);
    List<Booking> findByCustomerIdAndStatus(Long customerId, String status);

    long countByScheduleId(Long scheduleId);
}