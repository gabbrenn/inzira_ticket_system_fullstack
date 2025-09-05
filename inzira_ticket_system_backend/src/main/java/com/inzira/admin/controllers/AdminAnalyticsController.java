package com.inzira.admin.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.PaymentRepository;
import com.inzira.shared.exceptions.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping("/bookings/trend/day")
    public ResponseEntity<ApiResponse<List<TrendPoint>>> bookingsByDay(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        LocalDate cur = start;
        java.util.ArrayList<TrendPoint> points = new java.util.ArrayList<>();
        while (!cur.isAfter(end)) {
            LocalDateTime s = cur.atStartOfDay();
            LocalDateTime e = cur.atTime(LocalTime.MAX);
            long c = bookingRepository.countByCreatedAtBetween(s, e);
            points.add(new TrendPoint(cur.toString(), c));
            cur = cur.plusDays(1);
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Bookings per day", points));
    }

    @GetMapping("/bookings/trend/week")
    public ResponseEntity<ApiResponse<List<TrendPoint>>> bookingsByWeek(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        // Align to week starts (Monday)
        LocalDate cur = start.minusDays((start.getDayOfWeek().getValue() + 6) % 7);
        java.util.ArrayList<TrendPoint> points = new java.util.ArrayList<>();
        while (!cur.isAfter(end)) {
            LocalDate weekStart = cur;
            LocalDate weekEnd = cur.plusDays(6);
            if (weekStart.isBefore(start)) weekStart = start;
            if (weekEnd.isAfter(end)) weekEnd = end;
            long c = bookingRepository.countByCreatedAtBetween(weekStart.atStartOfDay(), weekEnd.atTime(LocalTime.MAX));
            points.add(new TrendPoint(weekStart.toString(), c));
            cur = cur.plusWeeks(1);
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Bookings per week", points));
    }

    @GetMapping("/payments/trend/day")
    public ResponseEntity<ApiResponse<List<TrendPoint>>> paymentsByDay(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        LocalDate cur = start;
        java.util.ArrayList<TrendPoint> points = new java.util.ArrayList<>();
        while (!cur.isAfter(end)) {
            LocalDateTime s = cur.atStartOfDay();
            LocalDateTime e = cur.atTime(LocalTime.MAX);
            java.math.BigDecimal sum = paymentRepository
                .findByStatusAndCreatedAtBetween("SUCCESS", s, e)
                .stream()
                .map(p -> p.getAmount() == null ? java.math.BigDecimal.ZERO : p.getAmount())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            points.add(new TrendPoint(cur.toString(), sum.longValue()));
            cur = cur.plusDays(1);
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Payments per day", points));
    }

    @GetMapping("/payments/trend/week")
    public ResponseEntity<ApiResponse<List<TrendPoint>>> paymentsByWeek(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        LocalDateTime s = start.atStartOfDay();
        // Align to week starts (Monday)
        LocalDate cur = start.minusDays((start.getDayOfWeek().getValue() + 6) % 7);
        java.util.ArrayList<TrendPoint> points = new java.util.ArrayList<>();
        while (!cur.isAfter(end)) {
            LocalDate weekStart = cur;
            LocalDate weekEnd = cur.plusDays(6);
            if (weekStart.isBefore(start)) weekStart = start;
            if (weekEnd.isAfter(end)) weekEnd = end;
            java.math.BigDecimal sum = paymentRepository
                .findByStatusAndCreatedAtBetween("SUCCESS", weekStart.atStartOfDay(), weekEnd.atTime(LocalTime.MAX))
                .stream()
                .map(p -> p.getAmount() == null ? java.math.BigDecimal.ZERO : p.getAmount())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            points.add(new TrendPoint(weekStart.toString(), sum.longValue()));
            cur = cur.plusWeeks(1);
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Payments per week", points));
    }
    // There is no SQL or database-specific code at $PLACEHOLDER$, so there is no conflict between PostgreSQL and MySQL here.
    // All repository methods used (countByCreatedAtBetween, findByStatusAndCreatedAtBetween, topAgenciesByBookings, topAgenciesByRevenue)
    // must be implemented in a way that works for both databases, but nothing in this controller is inherently incompatible.
    // The code uses standard Java and Spring Data features, which are database-agnostic.
    @GetMapping("/top/agencies/bookings")
    public ResponseEntity<ApiResponse<List<LeaderboardRow>>> topAgenciesByBookings(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
        @RequestParam(defaultValue = "10") int limit) {
        LocalDateTime s = start.atStartOfDay();
        LocalDateTime e = end.atTime(LocalTime.MAX);
        List<LeaderboardRow> rows = bookingRepository.topAgenciesByBookings(s, e).stream()
            .map(r -> new LeaderboardRow(((Number) r[0]).longValue(), String.valueOf(r[1]), ((Number) r[2]).doubleValue()))
            .limit(limit)
            .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Top agencies by bookings", rows));
    }

    @GetMapping("/top/agencies/revenue")
    public ResponseEntity<ApiResponse<List<LeaderboardRow>>> topAgenciesByRevenue(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
        @RequestParam(defaultValue = "10") int limit) {
        LocalDateTime s = start.atStartOfDay();
        LocalDateTime e = end.atTime(LocalTime.MAX);
        List<LeaderboardRow> rows = paymentRepository.topAgenciesByRevenue(s, e).stream()
            .map(r -> new LeaderboardRow(((Number) r[0]).longValue(), String.valueOf(r[1]), ((Number) r[2]).doubleValue()))
            .limit(limit)
            .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Top agencies by revenue", rows));
    }

    public static class TrendPoint {
        public String bucket;
        public long value;
        public TrendPoint(String bucket, long value) { this.bucket = bucket; this.value = value; }
    }

    public static class LeaderboardRow {
        public long id;
        public String name;
        public double value;
        public LeaderboardRow(long id, String name, double value) { this.id = id; this.name = name; this.value = value; }
    }
}
