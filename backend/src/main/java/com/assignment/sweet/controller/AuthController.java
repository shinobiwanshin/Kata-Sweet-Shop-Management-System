package com.assignment.sweet.controller;

import com.assignment.sweet.service.AuthService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.svix.Webhook;
import com.svix.exceptions.WebhookVerificationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.http.HttpHeaders;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final ObjectMapper objectMapper;

    @Value("${clerk.webhook-secret:}")
    private String webhookSecret;

    public AuthController(AuthService authService, ObjectMapper objectMapper) {
        this.authService = authService;
        this.objectMapper = objectMapper;
    }

    /**
     * Webhook endpoint for Clerk user events
     * This endpoint should be configured in your Clerk dashboard
     * 
     * SECURITY: Verifies Svix signature to prevent forged webhook requests
     */
    @PostMapping("/clerk/webhook")
    public ResponseEntity<String> handleClerkWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "svix-id", required = false) String svixId,
            @RequestHeader(value = "svix-timestamp", required = false) String svixTimestamp,
            @RequestHeader(value = "svix-signature", required = false) String svixSignature) {
        try {
            Map<String, Object> eventData;

            // Verify webhook signature if webhook secret is configured
            if (webhookSecret != null && !webhookSecret.isEmpty()
                    && !webhookSecret.equals("whsec_change-me-in-production")) {
                if (svixId == null || svixTimestamp == null || svixSignature == null) {
                    log.warn("Webhook received without Svix headers - rejecting");
                    return ResponseEntity.status(401).body("Missing webhook signature headers");
                }

                try {
                    Webhook webhook = new Webhook(webhookSecret);
                    // Build java.net.http.HttpHeaders for Svix verification
                    HttpHeaders headers = HttpHeaders.of(
                            Map.of(
                                    "svix-id", List.of(svixId),
                                    "svix-timestamp", List.of(svixTimestamp),
                                    "svix-signature", List.of(svixSignature)),
                            (name, value) -> true);
                    webhook.verify(payload, headers);
                    log.debug("Webhook signature verified successfully");
                } catch (WebhookVerificationException e) {
                    log.error("Webhook signature verification failed", e);
                    return ResponseEntity.status(401).body("Invalid webhook signature");
                }
            } else {
                log.warn("Webhook secret not configured - signature verification skipped (NOT SAFE FOR PRODUCTION)");
            }

            // Parse the verified payload
            eventData = objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {
            });

            authService.handleClerkUserEvent(eventData);
            String eventType = (String) eventData.get("type");

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
