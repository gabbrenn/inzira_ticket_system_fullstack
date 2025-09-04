package com.inzira.shared.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inzira.shared.entities.Booking;
import com.inzira.shared.entities.Schedule;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.ScheduleRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UnpaidBookingCleanupService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    /**
     * Runs every minute. Deletes bookings that are still PENDING and paymentStatus=PENDING
     * created more than 5 minutes ago, and restores seats to the schedule.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupUnpaidBookings() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        List<Booking> expired = bookingRepository
            .findByStatusAndPaymentStatusAndCreatedAtBefore("PENDING", "PENDING", cutoff);

        if (expired.isEmpty()) return;

        int restoredSeats = 0;
        for (Booking b : expired) {
            try {
                Schedule s = b.getSchedule();
                if (s != null) {
                    s.setAvailableSeats(s.getAvailableSeats() + b.getNumberOfSeats());
                    scheduleRepository.save(s);
                    restoredSeats += b.getNumberOfSeats();
                }
                bookingRepository.delete(b);
            } catch (Exception e) {
                log.warn("Failed to cleanup booking {}: {}", b.getId(), e.getMessage());
            }
        }

        log.info("Unpaid booking cleanup: deleted {} bookings, restored {} seats", expired.size(), restoredSeats);
    }
}
