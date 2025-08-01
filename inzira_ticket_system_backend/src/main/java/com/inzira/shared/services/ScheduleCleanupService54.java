package com.inzira.shared.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inzira.shared.entities.Schedule;
import com.inzira.shared.repositories.ScheduleRepository;

@Service
public class ScheduleCleanupService54 {

    @Autowired
    private ScheduleRepository scheduleRepository;

    /**
     * Automatically update schedule status for expired schedules
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 milliseconds
    @Transactional
    public void updateExpiredSchedules() {
        LocalDate today = LocalDate.now();
        
        // Find all scheduled trips that are past their departure date
        List<Schedule> expiredSchedules = scheduleRepository.findAll()
            .stream()
            .filter(schedule -> "SCHEDULED".equals(schedule.getStatus()) && 
                              schedule.getDepartureDate().isBefore(today))
            .toList();

        for (Schedule schedule : expiredSchedules) {
            // Mark as DEPARTED if it was yesterday or today
            if (schedule.getDepartureDate().equals(today.minusDays(1)) || 
                schedule.getDepartureDate().equals(today)) {
                schedule.setStatus("DEPARTED");
            } else {
                // Mark as COMPLETED if it's older than yesterday
                schedule.setStatus("COMPLETED");
            }
            scheduleRepository.save(schedule);
        }

        if (!expiredSchedules.isEmpty()) {
            System.out.println("Updated " + expiredSchedules.size() + " expired schedules");
        }
    }

    /**
     * Manual method to update expired schedules
     * Can be called from admin interface
     */
    @Transactional
    public int manuallyUpdateExpiredSchedules() {
        LocalDate today = LocalDate.now();
        
        List<Schedule> expiredSchedules = scheduleRepository.findAll()
            .stream()
            .filter(schedule -> "SCHEDULED".equals(schedule.getStatus()) && 
                              schedule.getDepartureDate().isBefore(today))
            .toList();

        for (Schedule schedule : expiredSchedules) {
            if (schedule.getDepartureDate().equals(today.minusDays(1)) || 
                schedule.getDepartureDate().equals(today)) {
                schedule.setStatus("DEPARTED");
            } else {
                schedule.setStatus("COMPLETED");
            }
            scheduleRepository.save(schedule);
        }

        return expiredSchedules.size();
    }

    /**
     * Get statistics about schedule statuses
     */
    public ScheduleStats getScheduleStats() {
        List<Schedule> allSchedules = scheduleRepository.findAll();
        
        long scheduled = allSchedules.stream().filter(s -> "SCHEDULED".equals(s.getStatus())).count();
        long departed = allSchedules.stream().filter(s -> "DEPARTED".equals(s.getStatus())).count();
        long completed = allSchedules.stream().filter(s -> "COMPLETED".equals(s.getStatus())).count();
        long cancelled = allSchedules.stream().filter(s -> "CANCELLED".equals(s.getStatus())).count();
        
        return new ScheduleStats(scheduled, departed, completed, cancelled);
    }

    public static class ScheduleStats {
        private final long scheduled;
        private final long departed;
        private final long completed;
        private final long cancelled;

        public ScheduleStats(long scheduled, long departed, long completed, long cancelled) {
            this.scheduled = scheduled;
            this.departed = departed;
            this.completed = completed;
            this.cancelled = cancelled;
        }

        public long getScheduled() { return scheduled; }
        public long getDeparted() { return departed; }
        public long getCompleted() { return completed; }
        public long getCancelled() { return cancelled; }
    }
}