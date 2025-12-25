package com.assignment.sweet.controller;

import com.assignment.sweet.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Webhook endpoint for Clerk user events
     * This endpoint should be configured in your Clerk dashboard
     */
    @PostMapping("/clerk/webhook")
    public ResponseEntity<String> handleClerkWebhook(@RequestBody Map<String, Object> payload) {
        try {
            authService.handleClerkUserEvent(payload);
            String eventType = (String) payload.get("type");

            if ("user.created".equals(eventType) || "user.updated".equals(eventType)) {
                return ResponseEntity.ok("User event processed successfully");
            }

            return ResponseEntity.ok("Event type not handled: " + eventType);
        } catch (Exception e) {
            log.error("Failed to process Clerk webhook", e);
            return ResponseEntity.internalServerError().body("Failed to process webhook");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody com.assignment.sweet.dto.RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody com.assignment.sweet.dto.LoginRequest request) {
        try {
            String token = authService.login(request);
            return ResponseEntity.ok(java.util.Map.of("token", token));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
