package com.inzira.shared.controllers;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.inzira.shared.entities.Payment;
import com.inzira.shared.repositories.BookingRepository;
import com.inzira.shared.repositories.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionRetrieveParams;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payments/confirm")
@Slf4j
public class StripeCheckoutConfirmController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Value("${stripe.secret.key:}")
    private String secretKey;

    @PostMapping("/stripe")
    public ResponseEntity<?> confirmStripeCheckout(
            @RequestParam("session_id") String sessionId,
            @RequestParam("ref") String reference) {
        try {
            if (secretKey != null && !secretKey.isBlank()) {
                Stripe.apiKey = secretKey; // Ensure API key is set
            }

            // Retrieve session with expanded payment_intent
            SessionRetrieveParams retrieveParams = SessionRetrieveParams.builder()
                .addExpand("payment_intent")
                .build();
            Session session = Session.retrieve(sessionId, retrieveParams, null);

            if (session == null) {
                return ResponseEntity.badRequest().body("Invalid session");
            }

            // Verify reference matches
            String clientRef = session.getClientReferenceId();
            if (clientRef != null && reference != null && !clientRef.equals(reference)) {
                log.warn("Reference mismatch. Provided: {}, Session: {}", reference, clientRef);
                return ResponseEntity.badRequest().body("Reference mismatch");
            }

            boolean paid = "paid".equalsIgnoreCase(session.getPaymentStatus());

            // Fallback: check payment intent status
            String paymentIntentId = null;
            if (session.getPaymentIntent() != null) {
                paymentIntentId = session.getPaymentIntent();
            } else if (session.getPaymentIntentObject() != null) {
                paymentIntentId = session.getPaymentIntentObject().getId();
            }
            if (!paid && paymentIntentId != null) {
                PaymentIntent pi = PaymentIntent.retrieve(paymentIntentId);
                paid = pi != null && "succeeded".equalsIgnoreCase(pi.getStatus());
            }

            if (!paid) {
                return ResponseEntity.badRequest().body("Payment not completed");
            }

            Payment payment = paymentRepository.findByTransactionReference(reference)
                .orElse(null);
            if (payment == null) {
                return ResponseEntity.badRequest().body("Payment record not found");
            }

            payment.setStatus("SUCCESS");
            payment.setCallbackData("{\"session_id\":\"" + sessionId + "\",\"payment_intent\":\"" + (paymentIntentId != null ? paymentIntentId : "") + "\"}");
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Update booking payment status and auto-confirm + generate ticket
            var booking = payment.getBooking();
            booking.setPaymentStatus("PAID");
            booking.setStatus("CONFIRMED");
            try {
                if (booking.getTicketPdfPath() == null || booking.getTicketPdfPath().isBlank()) {
                    // Generate ticket PDF so guests can download immediately
                    com.inzira.shared.services.PDFTicketService pdf = new com.inzira.shared.services.PDFTicketService();
                    String pdfPath = pdf.generateTicketPDF(booking);
                    booking.setTicketPdfPath(pdfPath);
                }
            } catch (Exception genEx) {
                log.warn("Failed to generate PDF ticket on confirm: {}", genEx.getMessage());
            }
            bookingRepository.save(booking);

            log.info("Stripe session confirmed without webhook. Ref: {}", reference);
            return ResponseEntity.ok().body("confirmed");

        } catch (StripeException e) {
            log.error("Stripe error confirming session: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Stripe error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error confirming Stripe session: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Confirmation error");
        }
    }
}
