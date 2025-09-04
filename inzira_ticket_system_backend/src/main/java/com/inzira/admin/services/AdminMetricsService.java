package com.inzira.admin.services;

import org.springframework.stereotype.Service;

import com.inzira.admin.dtos.AdminMetricsSummary;
import com.inzira.agency.repositories.AgencyRepository;
import com.inzira.shared.repositories.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminMetricsService {
    private final AgencyRepository agencyRepository;
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;
    private final RouteRepository routeRepository;
    private final BusRepository busRepository;
    private final DriverRepository driverRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public AdminMetricsSummary getSummary() {
        AdminMetricsSummary s = new AdminMetricsSummary();
        s.setTotalProvinces(provinceRepository.count());
        s.setTotalDistricts(districtRepository.count());
        s.setTotalRoutes(routeRepository.count());
        s.setTotalAgencies(agencyRepository.count());
        s.setActiveAgencies(agencyRepository.findAll().stream().filter(a -> "ACTIVE".equalsIgnoreCase(a.getStatus())).count());
        s.setInactiveAgencies(Math.max(0, s.getTotalAgencies() - s.getActiveAgencies()));
        s.setTotalBuses(busRepository.count());
        s.setTotalDrivers(driverRepository.count());
        s.setTotalBookings(bookingRepository.count());
        s.setConfirmedBookings(bookingRepository.countByStatus("CONFIRMED"));
        s.setPendingBookings(bookingRepository.countByStatus("PENDING"));
        s.setCompletedBookings(bookingRepository.countByStatus("COMPLETED"));
        s.setCancelledBookings(bookingRepository.countByStatus("CANCELLED"));
        s.setPaymentsSuccess(paymentRepository.findByStatus("SUCCESS").size());
        s.setPaymentsPending(paymentRepository.findByStatus("PENDING").size());
        s.setPaymentsRefunded(paymentRepository.findByStatus("REFUNDED").size());
        return s;
    }
}
