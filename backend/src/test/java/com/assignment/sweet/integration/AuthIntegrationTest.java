package com.assignment.sweet.integration;

import com.assignment.sweet.dto.LoginRequest;
import com.assignment.sweet.dto.RegisterRequest;
import com.assignment.sweet.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for authentication endpoints.
 * These tests verify the complete auth flow including database interactions.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // Clean up test users before each test
        userRepository.findByEmail("integration-test@example.com")
                .ifPresent(user -> userRepository.delete(user));
        userRepository.findByEmail("login-test@example.com")
                .ifPresent(user -> userRepository.delete(user));
    }

    @Test
    void register_ShouldCreateNewUser_WhenValidRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "integration-test@example.com",
                "securePassword123",
                "USER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("integration-test@example.com"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.id").exists());

        // Verify user exists in database
        assertTrue(userRepository.existsByEmail("integration-test@example.com"));
    }

    @Test
    void register_ShouldReturnError_WhenEmailAlreadyExists() throws Exception {
        // First registration
        RegisterRequest request = new RegisterRequest(
                "integration-test@example.com",
                "securePassword123",
                "USER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Second registration with same email should fail
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already exists"));
    }

    @Test
    void login_ShouldReturnToken_WhenValidCredentials() throws Exception {
        // First register a user
        RegisterRequest registerRequest = new RegisterRequest(
                "login-test@example.com",
                "securePassword123",
                "USER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // Then login with correct credentials
        LoginRequest loginRequest = new LoginRequest(
                "login-test@example.com",
                "securePassword123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        // Verify token is a valid JWT format (header.payload.signature)
        String response = result.getResponse().getContentAsString();
        assertTrue(response.contains("token"));
        String token = objectMapper.readTree(response).get("token").asText();
        assertEquals(3, token.split("\\.").length, "Token should be valid JWT format");
    }

    @Test
    void login_ShouldReturnError_WhenUserNotFound() throws Exception {
        LoginRequest loginRequest = new LoginRequest(
                "nonexistent@example.com",
                "anyPassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("User not found"));
    }

    @Test
    void login_ShouldReturnError_WhenPasswordIsInvalid() throws Exception {
        // First register a user
        RegisterRequest registerRequest = new RegisterRequest(
                "login-test@example.com",
                "correctPassword",
                "USER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // Then login with wrong password
        LoginRequest loginRequest = new LoginRequest(
                "login-test@example.com",
                "wrongPassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid password"));
    }

    @Test
    void fullAuthFlow_RegisterLoginAndVerifyToken() throws Exception {
        // Register - Try to request ADMIN role, should be forced to USER
        RegisterRequest registerRequest = new RegisterRequest(
                "integration-test@example.com",
                "securePassword123",
                "ADMIN");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("USER")); // Expect USER even if ADMIN was requested

        // Login
        LoginRequest loginRequest = new LoginRequest(
                "integration-test@example.com",
                "securePassword123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        // Verify the token contains the correct user info
        String token = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();

        // Decode JWT payload (base64)
        String payload = new String(java.util.Base64.getDecoder()
                .decode(token.split("\\.")[1]));
        assertTrue(payload.contains("integration-test@example.com"));
        // Token should contain USER role, not ADMIN
        assertTrue(payload.contains("USER"));
    }
}
