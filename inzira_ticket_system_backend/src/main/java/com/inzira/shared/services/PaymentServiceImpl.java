package com.inzira.shared.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inzira.shared.dtos.PaymentRequest;
import com.inzira.shared.dtos.PaymentResponse;
import com.inzira.shared.dtos.PaymentStatus;
import com.inzira.shared.entities.Booking;
import com.inzira.shared.entities.Payment;
import com.inzira.shared.exceptions.ResourceNotFoundException;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.PaymentRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private StripePaymentService stripePaymentService;

    @Override
    @Transactional
    public PaymentResponse initiatePayment(PaymentRequest request) {
        try {
            log.info("Initiating payment for booking: {}", request.getBookingId());
            
            // Validate booking exists
            Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            
            // Check if payment already exists
            if (paymentRepository.findByBookingId(request.getBookingId()).isPresent()) {
                return PaymentResponse.error("Payment already exists for this booking");
            }
            
            // Generate transaction reference
            String transactionReference = generateTransactionReference();
            
            // Create payment record
            Payment payment = createPaymentRecord(request, booking, transactionReference);
            Payment savedPayment = paymentRepository.save(payment);
            
            // Process payment based on method
            PaymentResponse response = processPaymentByMethod(request, savedPayment);
            
            log.info("Payment initiated successfully. Reference: {}", transactionReference);
            return response;
            
        } catch (Exception e) {
            log.error("Error initiating payment: {}", e.getMessage(), e);
            return PaymentResponse.error("Failed to initiate payment: " + e.getMessage());
        }
    }

    @Override
    public PaymentStatus checkPaymentStatus(String reference) {
        try {
            Payment payment = paymentRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
            
            PaymentStatus status = new PaymentStatus();
            status.setTransactionReference(payment.getTransactionReference());
            status.setStatus(payment.getStatus());
            status.setAmount(payment.getAmount());
            status.setCurrency(payment.getCurrency());
            status.setPaymentMethod(payment.getPaymentMethod());
            status.setCreatedAt(payment.getCreatedAt());
            status.setUpdatedAt(payment.getUpdatedAt());
            status.setFailureReason(payment.getFailureReason());
            status.setCompleted(!payment.getStatus().equals("PENDING"));
            status.setSuccessful("SUCCESS".equals(payment.getStatus()));
            
            return status;
            
        } catch (Exception e) {
            log.error("Error checking payment status: {}", e.getMessage(), e);
            PaymentStatus status = new PaymentStatus();
            status.setStatus("ERROR");
            status.setMessage("Failed to check payment status: " + e.getMessage());
            return status;
        }
    }

    @Override
    @Transactional
    public boolean processCallback(String reference, String callbackData) {
        try {
            Payment payment = paymentRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
            
            // Update payment with callback data
            payment.setCallbackData(callbackData);
            payment.setUpdatedAt(LocalDateTime.now());
            
            // Process callback based on payment method
            boolean success = processCallbackByMethod(payment, callbackData);
            
            if (success) {
                payment.setStatus("SUCCESS");
                payment.setUpdatedAt(LocalDateTime.now());
                
                // Update booking payment status
                Booking booking = payment.getBooking();
                booking.setPaymentStatus("PAID");
                bookingRepository.save(booking);
            }
            
            paymentRepository.save(payment);
            return success;
            
        } catch (Exception e) {
            log.error("Error processing callback: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean cancelPayment(String reference) {
        try {
            Payment payment = paymentRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
            
            if (!"PENDING".equals(payment.getStatus())) {
                log.warn("Cannot cancel payment with status: {}", payment.getStatus());
                return false;
            }
            
            payment.setStatus("CANCELLED");
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            
            log.info("Payment cancelled successfully. Reference: {}", reference);
            return true;
            
        } catch (Exception e) {
            log.error("Error cancelling payment: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean processRefund(String reference, BigDecimal amount) {
        try {
            Payment payment = paymentRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
            
            if (!"SUCCESS".equals(payment.getStatus())) {
                log.warn("Cannot refund payment with status: {}", payment.getStatus());
                return false;
            }
            
            // Process refund based on payment method
            boolean success = processRefundByMethod(payment, amount);
            
            if (success) {
                payment.setStatus("REFUNDED");
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);
                
                log.info("Refund processed successfully. Reference: {}", reference);
            }
            
            return success;
            
        } catch (Exception e) {
            log.error("Error processing refund: {}", e.getMessage(), e);
            return false;
        }
    }

    // Helper methods
    private String generateTransactionReference() {
        return "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8);
    }
    
    private Payment createPaymentRecord(PaymentRequest request, Booking booking, String transactionReference) {
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus("PENDING");
        payment.setTransactionReference(transactionReference);
        payment.setCurrency(request.getCurrency());
        payment.setDescription(request.getDescription());
        payment.setEmail(request.getEmail());
        payment.setCustomerName(request.getCustomerName());
        payment.setPaymentProvider(determinePaymentProvider(request.getPaymentMethod()));
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        return payment;
    }
    
    private String determinePaymentProvider(String paymentMethod) {
        switch (paymentMethod) {
            case "STRIPE":
                return "STRIPE";
            case "CASH":
                return "CASH";
            default:
                return "UNKNOWN";
        }
    }
    
    private PaymentResponse processPaymentByMethod(PaymentRequest request, Payment payment) {
        try {
            switch (request.getPaymentMethod()) {
                case "STRIPE":
                    return stripePaymentService.processPayment(request, payment);
                case "CASH":
                    return processCashPayment(request, payment);
                default:
                    return PaymentResponse.error("Unsupported payment method");
            }
        } catch (Exception e) {
            log.error("Error processing payment by method: {}", e.getMessage(), e);
            return PaymentResponse.error("Payment processing failed: " + e.getMessage());
        }
    }
    
    private PaymentResponse processCashPayment(PaymentRequest request, Payment payment) {
        // For cash payments, mark as successful immediately
        payment.setStatus("SUCCESS");
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        
        // Update booking payment status
        Booking booking = payment.getBooking();
        booking.setPaymentStatus("PAID");
        bookingRepository.save(booking);
        
        return PaymentResponse.success(payment.getId(), payment.getTransactionReference(), 
                                    payment.getAmount(), payment.getCurrency(), payment.getPaymentMethod());
    }
    
    private boolean processCallbackByMethod(Payment payment, String callbackData) {
        try {
            switch (payment.getPaymentMethod()) {
                case "STRIPE":
                    return stripePaymentService.processCallback(payment, callbackData);
                default:
                    log.warn("Unknown payment method for callback: {}", payment.getPaymentMethod());
                    return false;
            }
        } catch (Exception e) {
            log.error("Error processing callback by method: {}", e.getMessage(), e);
            return false;
        }
    }
    
    private boolean processRefundByMethod(Payment payment, BigDecimal amount) {
        try {
            switch (payment.getPaymentMethod()) {
                case "STRIPE":
                    return stripePaymentService.processRefund(payment, amount);
                default:
                    log.warn("Refund not supported for payment method: {}", payment.getPaymentMethod());
                    return false;
            }
        } catch (Exception e) {
            log.error("Error processing refund by method: {}", e.getMessage(), e);
            return false;
        }
    }
}
