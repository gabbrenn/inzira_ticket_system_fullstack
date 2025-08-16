package com.inzira.shared.services;

import com.inzira.shared.dtos.PaymentRequest;
import com.inzira.shared.dtos.PaymentResponse;
import com.inzira.shared.dtos.PaymentStatus;

public interface PaymentService {
    
    /**
     * Initiate a payment
     * @param request Payment request details
     * @return Payment response with status and next steps
     */
    PaymentResponse initiatePayment(PaymentRequest request);
    
    /**
     * Check payment status
     * @param reference Transaction reference
     * @return Current payment status
     */
    PaymentStatus checkPaymentStatus(String reference);
    
    /**
     * Process payment callback from provider
     * @param reference Transaction reference
     * @param callbackData Callback data from payment provider
     * @return Success status
     */
    boolean processCallback(String reference, String callbackData);
    
    /**
     * Cancel a pending payment
     * @param reference Transaction reference
     * @return Success status
     */
    boolean cancelPayment(String reference);
    
    /**
     * Process refund
     * @param reference Transaction reference
     * @param amount Refund amount
     * @return Success status
     */
    boolean processRefund(String reference, java.math.BigDecimal amount);
}
