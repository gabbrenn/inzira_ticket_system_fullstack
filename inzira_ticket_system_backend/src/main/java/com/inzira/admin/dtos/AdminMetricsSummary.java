package com.inzira.admin.dtos;

import lombok.Data;

@Data
public class AdminMetricsSummary {
    private long totalProvinces;
    private long totalDistricts;
    private long totalRoutes;
    private long totalAgencies;
    private long activeAgencies;
    private long inactiveAgencies;
    private long totalBuses;
    private long totalDrivers;
    private long totalBookings;
    private long confirmedBookings;
    private long pendingBookings;
    private long completedBookings;
    private long cancelledBookings;
    private long paymentsSuccess;
    private long paymentsPending;
    private long paymentsRefunded;
}
