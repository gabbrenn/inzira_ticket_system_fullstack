package com.inzira.shared.controllers;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inzira.shared.repositories.PaymentRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payments/webhook/stripe")
@Slf4j
public class StripeWebhookController {

    private final PaymentRepository paymentRepository;

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    public StripeWebhookController(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(name = "Stripe-Signature", required = false) String sigHeader) {
        try {
            if (webhookSecret == null || webhookSecret.isBlank()) {
                log.error("Stripe webhook secret is not configured");
                return ResponseEntity.status(500).body("Stripe webhook not configured");
            }
            if (sigHeader == null || sigHeader.isBlank()) {
                log.warn("Missing Stripe-Signature header");
                return ResponseEntity.badRequest().body("Missing signature");
            }

            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            String eventType = event.getType();
            log.info("Stripe webhook received: {}", eventType);

            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
            if (!deserializer.getObject().isPresent()) {
                log.warn("Unable to deserialize event data for type: {}", eventType);
                return ResponseEntity.ok("ignored");
            }
            StripeObject stripeObject = deserializer.getObject().get();

            switch (eventType) {
                case "checkout.session.completed":
                case "checkout.session.async_payment_succeeded": {
                    if (stripeObject instanceof Session) {
                        Session session = (Session) stripeObject;
                        String ref = session.getClientReferenceId();
                        if (ref != null) {
                            paymentRepository.findByTransactionReference(ref).ifPresent(payment -> {
                                payment.setStatus("SUCCESS");
                                payment.setCallbackData(payload);
                                payment.setUpdatedAt(LocalDateTime.now());
                                paymentRepository.save(payment);
                                log.info("Payment marked SUCCESS via webhook. Ref: {}", ref);
                            });
                        }
                    }
                    break;
                }
                case "payment_intent.payment_failed":
                case "checkout.session.async_payment_failed": {
                    String ref = null;
                    if (stripeObject instanceof PaymentIntent) {
                        PaymentIntent pi = (PaymentIntent) stripeObject;
                        if (pi.getMetadata() != null) {
                            ref = pi.getMetadata().get("payment_reference");
                        }
                    } else if (stripeObject instanceof Session) {
                        Session session = (Session) stripeObject;
                        ref = session.getClientReferenceId();
                    }
                    if (ref != null) {
                        final String fref = ref;
                        paymentRepository.findByTransactionReference(ref).ifPresent(payment -> {
                            payment.setStatus("FAILED");
                            payment.setFailureReason("Stripe reported failure: " + eventType);
                            payment.setCallbackData(payload);
                            payment.setUpdatedAt(LocalDateTime.now());
                            paymentRepository.save(payment);
                            log.info("Payment marked FAILED via webhook. Ref: {}", fref);
                        });
                    }
                    break;
                }
                case "charge.refunded":
                case "payment_intent.refunded": {
                    if (stripeObject instanceof PaymentIntent) {
                        PaymentIntent pi = (PaymentIntent) stripeObject;
                        String ref = pi.getMetadata() != null ? pi.getMetadata().get("payment_reference") : null;
                        if (ref != null) {
                            paymentRepository.findByTransactionReference(ref).ifPresent(payment -> {
                                payment.setStatus("REFUNDED");
                                payment.setCallbackData(payload);
                                payment.setUpdatedAt(LocalDateTime.now());
                                paymentRepository.save(payment);
                                log.info("Payment marked REFUNDED via webhook. Ref: {}", ref);
                            });
                        }
                    }
                    break;
                }
                default:
                    // Unhandled types can be ignored
                    log.debug("Unhandled Stripe event type: {}", eventType);
            }

            return ResponseEntity.ok("received");
        } catch (SignatureVerificationException e) {
            log.error("Stripe webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(400).body("Invalid signature");
        } catch (Exception e) {
            log.error("Error handling Stripe webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Webhook processing error");
        }
    }
}
