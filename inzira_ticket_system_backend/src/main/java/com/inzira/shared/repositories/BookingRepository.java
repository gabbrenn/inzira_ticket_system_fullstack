package com.inzira.shared.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    long countByStatus(String status);

    long countByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    // Cleanup support: find old unpaid bookings
    java.util.List<Booking> findByStatusAndPaymentStatusAndCreatedAtBefore(String status, String paymentStatus, java.time.LocalDateTime cutoff);

    // Trends moved to controller to remain DB-agnostic

    // Top agencies by bookings
    @Query("select a.id, a.agencyName, count(b.id) from Booking b join b.schedule s join s.agencyRoute ar join ar.agency a where b.createdAt between :start and :end group by a.id, a.agencyName order by count(b.id) desc")
    java.util.List<Object[]> topAgenciesByBookings(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}