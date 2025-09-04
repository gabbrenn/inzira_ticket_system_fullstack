package com.inzira.admin.controllers;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.inzira.shared.entities.Booking;
import com.inzira.shared.entities.Payment;
import com.inzira.shared.exceptions.ApiResponse;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.PaymentRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminListingController {
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public static class AgencyGroupSummary {
        public Long agencyId;
        public String agencyName;
        public long bookings;
        public long payments;
        public AgencyGroupSummary(Long agencyId, String agencyName, long bookings, long payments) {
            this.agencyId = agencyId; this.agencyName = agencyName; this.bookings = bookings; this.payments = payments;
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<Booking>>> listBookings(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long agencyId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<Booking> all = bookingRepository.findAll();
        List<Booking> filtered = all.stream()
            .filter(b -> status == null || status.isBlank() || status.equalsIgnoreCase(b.getStatus()))
            .filter(b -> {
                if (agencyId == null) return true;
                if (b.getSchedule() == null || b.getSchedule().getAgencyRoute() == null || b.getSchedule().getAgencyRoute().getAgency() == null) return false;
                return agencyId.equals(b.getSchedule().getAgencyRoute().getAgency().getId());
            })
            .filter(b -> {
                if (start == null && end == null) return true;
                LocalDateTime t = b.getCreatedAt();
                LocalDateTime s = start != null ? start.atStartOfDay() : LocalDate.MIN.atStartOfDay();
                LocalDateTime e = end != null ? end.atTime(LocalTime.MAX) : LocalDate.MAX.atTime(LocalTime.MAX);
                return t != null && (t.isEqual(s) || t.isAfter(s)) && (t.isEqual(e) || t.isBefore(e));
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Bookings", filtered));
    }

    @GetMapping("/bookings/export")
    public ResponseEntity<byte[]> exportBookingsCsv(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long agencyId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) throws IOException {
        List<Booking> bookings = listBookings(status, agencyId, start, end).getBody().getData();
        StringBuilder sb = new StringBuilder();
        sb.append("Reference,Agency,Customer,Status,PaymentStatus,Seats,Amount,CreatedAt\n");
        for (Booking b : bookings) {
            String agencyName = b.getSchedule()!=null && b.getSchedule().getAgencyRoute()!=null && b.getSchedule().getAgencyRoute().getAgency()!=null ? b.getSchedule().getAgencyRoute().getAgency().getAgencyName() : "";
            sb.append(String.join(",",
                safe(b.getBookingReference()),
                safe(agencyName),
                safe(b.getCustomer() != null ? (b.getCustomer().getFirstName()+" "+b.getCustomer().getLastName()) : ""),
                safe(b.getStatus()),
                safe(b.getPaymentStatus()),
                String.valueOf(b.getNumberOfSeats()),
                b.getTotalAmount() != null ? b.getTotalAmount().toString() : "",
                b.getCreatedAt() != null ? b.getCreatedAt().toString() : ""
            )).append("\n");
        }

        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings.csv")
            .contentType(MediaType.TEXT_PLAIN)
            .body(bytes);
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<Payment>>> listPayments(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long agencyId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<Payment> all = paymentRepository.findAll();
        List<Payment> filtered = all.stream()
            .filter(p -> status == null || status.isBlank() || status.equalsIgnoreCase(p.getStatus()))
            .filter(p -> {
                if (agencyId == null) return true;
                if (p.getBooking()==null || p.getBooking().getSchedule()==null || p.getBooking().getSchedule().getAgencyRoute()==null || p.getBooking().getSchedule().getAgencyRoute().getAgency()==null) return false;
                return agencyId.equals(p.getBooking().getSchedule().getAgencyRoute().getAgency().getId());
            })
            .filter(p -> {
                if (start == null && end == null) return true;
                var t = p.getCreatedAt();
                LocalDateTime s = start != null ? start.atStartOfDay() : LocalDate.MIN.atStartOfDay();
                LocalDateTime e = end != null ? end.atTime(LocalTime.MAX) : LocalDate.MAX.atTime(LocalTime.MAX);
                return t != null && (t.isEqual(s) || t.isAfter(s)) && (t.isEqual(e) || t.isBefore(e));
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Payments", filtered));
    }

    @GetMapping("/payments/export")
    public ResponseEntity<byte[]> exportPaymentsCsv(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long agencyId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<Payment> payments = listPayments(status, agencyId, start, end).getBody().getData();
        StringBuilder sb = new StringBuilder();
        sb.append("Reference,Agency,Status,Amount,Currency,Method,Customer,CreatedAt\n");
        for (Payment p : payments) {
            String agencyName = (p.getBooking()!=null && p.getBooking().getSchedule()!=null && p.getBooking().getSchedule().getAgencyRoute()!=null && p.getBooking().getSchedule().getAgencyRoute().getAgency()!=null) ? p.getBooking().getSchedule().getAgencyRoute().getAgency().getAgencyName() : "";
            sb.append(String.join(",",
                safe(p.getTransactionReference()),
                safe(agencyName),
                safe(p.getStatus()),
                p.getAmount() != null ? p.getAmount().toString() : "",
                safe(p.getCurrency()),
                safe(p.getPaymentMethod()),
                safe(p.getCustomerName()),
                p.getCreatedAt() != null ? p.getCreatedAt().toString() : ""
            )).append("\n");
        }

        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payments.csv")
            .contentType(MediaType.TEXT_PLAIN)
            .body(bytes);
    }

    private String safe(String s) {
        if (s == null) return "";
        String v = s.replace("\"", "\"\"");
        if (v.contains(",") || v.contains("\n")) {
            return "\"" + v + "\"";
        }
        return v;
    }

    @GetMapping("/groups/agencies/summary")
    public ResponseEntity<ApiResponse<List<AgencyGroupSummary>>> groupByAgency(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        LocalDateTime s = start != null ? start.atStartOfDay() : LocalDate.MIN.atStartOfDay();
        LocalDateTime e = end != null ? end.atTime(LocalTime.MAX) : LocalDate.MAX.atTime(LocalTime.MAX);

        // naive in-memory grouping using existing repos to avoid large refactors
        var bookings = bookingRepository.findAll().stream()
            .filter(b -> b.getCreatedAt()!=null && (b.getCreatedAt().isEqual(s) || b.getCreatedAt().isAfter(s)) && (b.getCreatedAt().isEqual(e) || b.getCreatedAt().isBefore(e)))
            .collect(Collectors.toList());
        var payments = paymentRepository.findAll().stream()
            .filter(p -> p.getCreatedAt()!=null && (p.getCreatedAt().isEqual(s) || p.getCreatedAt().isAfter(s)) && (p.getCreatedAt().isEqual(e) || p.getCreatedAt().isBefore(e)))
            .collect(Collectors.toList());

        java.util.Map<Long, AgencyGroupSummary> map = new java.util.HashMap<>();

        for (var b : bookings) {
            var agency = b.getSchedule()!=null && b.getSchedule().getAgencyRoute()!=null ? b.getSchedule().getAgencyRoute().getAgency() : null;
            if (agency == null) continue;
            var ag = map.computeIfAbsent(agency.getId(), id -> new AgencyGroupSummary(agency.getId(), agency.getAgencyName(), 0, 0));
            ag.bookings++;
        }
        for (var p : payments) {
            var agency = (p.getBooking()!=null && p.getBooking().getSchedule()!=null && p.getBooking().getSchedule().getAgencyRoute()!=null) ? p.getBooking().getSchedule().getAgencyRoute().getAgency() : null;
            if (agency == null) continue;
            var ag = map.computeIfAbsent(agency.getId(), id -> new AgencyGroupSummary(agency.getId(), agency.getAgencyName(), 0, 0));
            ag.payments++;
        }

        var result = map.values().stream()
            .sorted(java.util.Comparator.comparing((AgencyGroupSummary a) -> a.agencyName==null?"":a.agencyName))
            .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(true, "Grouped by agency", result));
    }
}
