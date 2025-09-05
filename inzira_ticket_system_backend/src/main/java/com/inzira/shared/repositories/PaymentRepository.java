package com.inzira.shared.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.inzira.shared.entities.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    List<Payment> findByStatus(String status);
    Optional<Payment> findByTransactionReference(String transactionReference);
    java.util.List<Payment> findByStatusAndCreatedAtBetween(String status, java.time.LocalDateTime start, java.time.LocalDateTime end);

    // Payment trends
    // Kept old JPQL aggregations removed to stay DB-agnostic

    // Top agencies by revenue
    @Query("select a.id, a.agencyName, sum(p.amount) from Payment p join p.booking b join b.schedule s join s.agencyRoute ar join ar.agency a where p.status = 'SUCCESS' and p.createdAt between :start and :end group by a.id, a.agencyName order by sum(p.amount) desc")
    java.util.List<Object[]> topAgenciesByRevenue(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}