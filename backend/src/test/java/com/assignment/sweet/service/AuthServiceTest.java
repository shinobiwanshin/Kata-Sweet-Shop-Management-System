package com.assignment.sweet.service;

import com.assignment.sweet.dto.RegisterRequest;
import com.assignment.sweet.model.User;
import com.assignment.sweet.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_ShouldCreateUser_WhenEmailIsUnique() {
        // Arrange
        RegisterRequest request = new RegisterRequest("test@example.com", "password", "USER");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });

        // Act
        User result = authService.register(request);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(request.getEmail(), result.getEmail());
        assertEquals("encodedPassword", result.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailAlreadyExists() {
        // Arrange
        RegisterRequest request = new RegisterRequest("existing@example.com", "password", "USER");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Mock
    private com.assignment.sweet.security.JwtTokenProvider jwtTokenProvider;

    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        // Arrange
        com.assignment.sweet.dto.LoginRequest request = new com.assignment.sweet.dto.LoginRequest("test@example.com",
                "password");
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");
        user.setRole("USER");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtTokenProvider.generateToken(user)).thenReturn("jwt-token");

        // Act
        String token = authService.login(request);

        // Assert
        assertEquals("jwt-token", token);
    }

    @Test
    void login_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        com.assignment.sweet.dto.LoginRequest request = new com.assignment.sweet.dto.LoginRequest("unknown@example.com",
                "password");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(java.util.Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.login(request));
    }

    @Test
    void login_ShouldThrowException_WhenPasswordIsInvalid() {
        // Arrange
        com.assignment.sweet.dto.LoginRequest request = new com.assignment.sweet.dto.LoginRequest("test@example.com",
                "wrongpassword");
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(false);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.login(request));
    }
}
