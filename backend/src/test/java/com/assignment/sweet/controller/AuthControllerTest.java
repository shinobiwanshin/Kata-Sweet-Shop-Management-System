package com.assignment.sweet.controller;

import com.assignment.sweet.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@WithMockUser
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void handleClerkWebhook_ShouldReturnSuccess_WhenUserCreatedEvent() throws Exception {
        // Prepare Clerk webhook payload for user.created event
        Map<String, Object> emailAddress = new HashMap<>();
        emailAddress.put("email_address", "test@example.com");

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", "clerk_user_123");
        userData.put("first_name", "John");
        userData.put("last_name", "Doe");
        userData.put("email_addresses", java.util.List.of(emailAddress));

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "user.created");
        payload.put("data", userData);

        doNothing().when(authService).handleClerkUserEvent(any());

        mockMvc.perform(post("/api/auth/clerk/webhook")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(content().string("User event processed successfully"));
    }

    @Test
    void handleClerkWebhook_ShouldReturnSuccess_WhenUserUpdatedEvent() throws Exception {
        // Prepare Clerk webhook payload for user.updated event
        Map<String, Object> emailAddress = new HashMap<>();
        emailAddress.put("email_address", "test@example.com");

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", "clerk_user_123");
        userData.put("first_name", "John");
        userData.put("last_name", "Smith");
        userData.put("email_addresses", java.util.List.of(emailAddress));

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "user.updated");
        payload.put("data", userData);

        doNothing().when(authService).handleClerkUserEvent(any());

        mockMvc.perform(post("/api/auth/clerk/webhook")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(content().string("User event processed successfully"));
    }

    @Test
    void handleClerkWebhook_ShouldReturnOk_WhenUnhandledEventType() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "user.deleted");
        payload.put("data", new HashMap<>());

        mockMvc.perform(post("/api/auth/clerk/webhook")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(content().string("Event type not handled: user.deleted"));
    }

    @Test
    void handleClerkWebhook_ShouldReturnOk_WhenDataIsNull() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "user.created");
        payload.put("data", null); // Null data should be handled gracefully

        mockMvc.perform(post("/api/auth/clerk/webhook")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(content().string("User event processed successfully"));
    }
}
