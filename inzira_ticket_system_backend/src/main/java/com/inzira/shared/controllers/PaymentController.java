package com.inzira.shared.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inzira.shared.dtos.PaymentRequest;
import com.inzira.shared.dtos.PaymentResponse;
import com.inzira.shared.dtos.PaymentStatus;
import com.inzira.shared.services.PaymentService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payments")
@Slf4j
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    /**
     * Initiate a payment
     */
    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponse> initiatePayment(@Valid @RequestBody PaymentRequest request) {
        try {
            log.info("Payment initiation request received for booking: {}", request.getBookingId());
            
            PaymentResponse response = paymentService.initiatePayment(request);
            
            if ("ERROR".equals(response.getStatus())) {
                return ResponseEntity.badRequest().body(response);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in payment initiation: {}", e.getMessage(), e);
            PaymentResponse errorResponse = PaymentResponse.error("Payment initiation failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Check payment status
     */
    @GetMapping("/status/{reference}")
    public ResponseEntity<PaymentStatus> getPaymentStatus(@PathVariable String reference) {
        try {
            log.info("Payment status check request for reference: {}", reference);
            
            PaymentStatus status = paymentService.checkPaymentStatus(reference);
            
            if ("ERROR".equals(status.getStatus())) {
                return ResponseEntity.badRequest().body(status);
            }
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            log.error("Error checking payment status: {}", e.getMessage(), e);
            PaymentStatus errorStatus = new PaymentStatus();
            errorStatus.setStatus("ERROR");
            errorStatus.setMessage("Failed to check payment status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorStatus);
        }
    }
    
    /**
     * Process payment callback from provider
     */
    @PostMapping("/callback/{provider}")
    public ResponseEntity<String> paymentCallback(
            @PathVariable String provider,
            @RequestBody String payload) {
        try {
            log.info("Payment callback received from provider: {}", provider);
            log.debug("Callback payload: {}", payload);
            
            // Extract transaction reference from payload
            // This is a simplified approach - in production, you'd parse the actual payload
            String reference = extractReferenceFromPayload(payload);
            
            if (reference != null) {
                boolean success = paymentService.processCallback(reference, payload);
                if (success) {
                    return ResponseEntity.ok("Callback processed successfully");
                } else {
                    return ResponseEntity.badRequest().body("Callback processing failed");
                }
            } else {
                log.warn("Could not extract reference from callback payload");
                return ResponseEntity.badRequest().body("Invalid callback payload");
            }
            
        } catch (Exception e) {
            log.error("Error processing payment callback: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Callback processing error");
        }
    }
    
    /**
     * Cancel a pending payment
     */
    @PostMapping("/cancel/{reference}")
    public ResponseEntity<String> cancelPayment(@PathVariable String reference) {
        try {
            log.info("Payment cancellation request for reference: {}", reference);
            
            boolean success = paymentService.cancelPayment(reference);
            
            if (success) {
                return ResponseEntity.ok("Payment cancelled successfully");
            } else {
                return ResponseEntity.badRequest().body("Payment cancellation failed");
            }
            
        } catch (Exception e) {
            log.error("Error cancelling payment: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Payment cancellation error");
        }
    }
    
    /**
     * Process refund
     */
    @PostMapping("/refund/{reference}")
    public ResponseEntity<String> processRefund(
            @PathVariable String reference,
            @RequestParam(defaultValue = "0") String amount) {
        try {
            log.info("Refund request for reference: {} with amount: {}", reference, amount);
            
            // Parse amount
            java.math.BigDecimal refundAmount;
            try {
                refundAmount = new java.math.BigDecimal(amount);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Invalid amount format");
            }
            
            boolean success = paymentService.processRefund(reference, refundAmount);
            
            if (success) {
                return ResponseEntity.ok("Refund processed successfully");
            } else {
                return ResponseEntity.badRequest().body("Refund processing failed");
            }
            
        } catch (Exception e) {
            log.error("Error processing refund: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Refund processing error");
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Payment service is running");
    }
    
    // Helper method to extract reference from callback payload
    private String extractReferenceFromPayload(String payload) {
        // This is a simplified implementation
        // In production, you would parse the actual payload format from your payment provider
        
        // For MoMo callbacks
        if (payload.contains("reference")) {
            // Extract reference from JSON or other format
            // This is just a placeholder - implement based on actual MoMo callback format
            return "TXN-" + System.currentTimeMillis();
        }
        
        // For Stripe webhooks
        if (payload.contains("client_reference_id")) {
            // Extract reference from Stripe webhook
            return "TXN-" + System.currentTimeMillis();
        }
        
        // For bank callbacks
        if (payload.contains("transaction_reference")) {
            // Extract reference from bank callback
            return "TXN-" + System.currentTimeMillis();
        }
        
        return null;
    }
}
