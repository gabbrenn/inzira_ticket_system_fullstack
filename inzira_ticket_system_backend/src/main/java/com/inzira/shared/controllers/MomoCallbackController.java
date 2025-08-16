package com.inzira.shared.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/momo")
public class MomoCallbackController {

    @PostMapping("/callback")
    public ResponseEntity<String> momoCallback(@RequestBody String payload) {
        System.out.println("MoMo Callback received: " + payload);
        return ResponseEntity.ok("Callback received");
    }
}
