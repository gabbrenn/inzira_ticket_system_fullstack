package com.inzira.shared.controllers;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/sse")
public class SSEController {

    private final ConcurrentHashMap<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);

    @GetMapping(value = "/seat-updates", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamSeatUpdates(@RequestParam(required = false) String token) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        String clientId = "client_" + System.currentTimeMillis();
        
        emitters.put(clientId, emitter);

        emitter.onCompletion(() -> emitters.remove(clientId));
        emitter.onTimeout(() -> emitters.remove(clientId));
        emitter.onError((ex) -> emitters.remove(clientId));

        // Send initial connection message
        try {
            emitter.send(SseEmitter.event()
                .name("connected")
                .data("{\"message\":\"Connected to seat updates\"}"));
        } catch (IOException e) {
            emitters.remove(clientId);
        }

        // Send periodic heartbeat to keep connection alive
        executor.scheduleAtFixedRate(() -> {
            try {
                emitter.send(SseEmitter.event()
                    .name("heartbeat")
                    .data("{\"timestamp\":" + System.currentTimeMillis() + "}"));
            } catch (IOException e) {
                emitters.remove(clientId);
            }
        }, 30, 30, TimeUnit.SECONDS);

        return emitter;
    }

    // Method to broadcast seat updates (would be called when bookings are made)
    public void broadcastSeatUpdate(Long scheduleId, Integer availableSeats) {
        String message = String.format(
            "{\"type\":\"SEAT_UPDATE\",\"scheduleId\":%d,\"availableSeats\":%d,\"timestamp\":%d}",
            scheduleId, availableSeats, System.currentTimeMillis()
        );

        emitters.values().forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                    .name("seat-update")
                    .data(message));
            } catch (IOException e) {
                // Remove failed emitter
                emitters.values().remove(emitter);
            }
        });
    }
}