package com.assignment.sweet.service;

import com.assignment.sweet.model.AuthType;
import com.assignment.sweet.model.User;
import com.assignment.sweet.repository.UserRepository;
import com.assignment.sweet.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    void syncUserFromClerk_ShouldUpdateExistingUser_WhenUserExistsByClerkId() {
        // Arrange
        String clerkId = "clerk_123";
        String email = "test@example.com";
        String firstName = "John";
        String lastName = "Doe";

        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setClerkId(clerkId);
        existingUser.setEmail("old@example.com");
        existingUser.setFirstName("Old");
        existingUser.setLastName("Name");
        existingUser.setAuthType(AuthType.CLERK);

        when(userRepository.findByClerkId(clerkId)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        // Act
        User result = authService.syncUserFromClerk(clerkId, email, firstName, lastName);

        // Assert
        assertNotNull(result);
        assertEquals(clerkId, result.getClerkId());
        assertEquals(email, result.getEmail());
        assertEquals(firstName, result.getFirstName());
        assertEquals(lastName, result.getLastName());
        verify(userRepository).save(existingUser);
    }

    @Test
    void syncUserFromClerk_ShouldMigrateExistingUser_WhenUserExistsByEmail() {
        // Arrange
        String clerkId = "clerk_123";
        String email = "test@example.com";
        String firstName = "John";
        String lastName = "Doe";

        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setEmail(email);
        existingUser.setFirstName("Old");
        existingUser.setLastName("Name");
        existingUser.setAuthType(AuthType.LOCAL); // Assume existing user was LOCAL before migration

        when(userRepository.findByClerkId(clerkId)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        // Act
        User result = authService.syncUserFromClerk(clerkId, email, firstName, lastName);

        // Assert
        assertNotNull(result);
        assertEquals(clerkId, result.getClerkId());
        assertEquals(email, result.getEmail());
        assertEquals(firstName, result.getFirstName());
        assertEquals(lastName, result.getLastName());
        verify(userRepository).save(existingUser);
    }

    @Test
    void syncUserFromClerk_ShouldCreateNewUser_WhenUserDoesNotExist() {
        // Arrange
        String clerkId = "clerk_123";
        String email = "test@example.com";
        String firstName = "John";
        String lastName = "Doe";

        User newUser = new User();
        newUser.setId(1L);
        newUser.setClerkId(clerkId);
        newUser.setEmail(email);
        newUser.setFirstName(firstName);
        newUser.setLastName(lastName);
        newUser.setRole("USER");
        newUser.setAuthType(AuthType.CLERK);

        when(userRepository.findByClerkId(clerkId)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        // Act
        User result = authService.syncUserFromClerk(clerkId, email, firstName, lastName);

        // Assert
        assertNotNull(result);
        assertEquals(clerkId, result.getClerkId());
        assertEquals(email, result.getEmail());
        assertEquals(firstName, result.getFirstName());
        assertEquals(lastName, result.getLastName());
        assertEquals("USER", result.getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void handleClerkUserEvent_ShouldProcessUserCreatedEvent() {
        // Arrange
        Map<String, Object> emailAddress = new HashMap<>();
        emailAddress.put("email_address", "test@example.com");

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", "clerk_123");
        userData.put("first_name", "John");
        userData.put("last_name", "Doe");
        userData.put("email_addresses", java.util.List.of(emailAddress));

        Map<String, Object> eventData = new HashMap<>();
        eventData.put("type", "user.created");
        eventData.put("data", userData);

        User syncedUser = new User();
        syncedUser.setId(1L);
        syncedUser.setClerkId("clerk_123");

        when(userRepository.findByClerkId("clerk_123")).thenReturn(Optional.of(syncedUser));
        when(userRepository.save(any(User.class))).thenReturn(syncedUser);

        // Act
        authService.handleClerkUserEvent(eventData);

        // Assert
        verify(userRepository).save(any(User.class));
    }

    @Test
    void handleClerkUserEvent_ShouldProcessUserUpdatedEvent() {
        // Arrange
        Map<String, Object> emailAddress = new HashMap<>();
        emailAddress.put("email_address", "test@example.com");

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", "clerk_123");
        userData.put("first_name", "John");
        userData.put("last_name", "Smith");
        userData.put("email_addresses", java.util.List.of(emailAddress));

        Map<String, Object> eventData = new HashMap<>();
        eventData.put("type", "user.updated");
        eventData.put("data", userData);

        User syncedUser = new User();
        syncedUser.setId(1L);
        syncedUser.setClerkId("clerk_123");
        syncedUser.setAuthType(AuthType.CLERK);

        when(userRepository.findByClerkId("clerk_123")).thenReturn(Optional.of(syncedUser));
        when(userRepository.save(any(User.class))).thenReturn(syncedUser);

        // Act
        authService.handleClerkUserEvent(eventData);

        // Assert
        verify(userRepository).save(any(User.class));
    }

    @Test
    void handleClerkUserEvent_ShouldHandleExceptionGracefully() {
        // Arrange
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("type", "user.created");
        eventData.put("data", null); // This will cause an exception

        // Act & Assert - Should not throw exception
        assertDoesNotThrow(() -> authService.handleClerkUserEvent(eventData));
    }

    @Test
    void handleClerkUserEvent_ShouldPromoteUserToAdmin_OnOrganizationMembershipCreated() {
        // Arrange
        Map<String, Object> emailAddress = new HashMap<>();
        emailAddress.put("email_address", "admin@example.com");

        Map<String, Object> userObj = new HashMap<>();
        userObj.put("email_addresses", java.util.List.of(emailAddress));

        Map<String, Object> membership = new HashMap<>();
        membership.put("role", "admin");
        membership.put("user", userObj);

        Map<String, Object> eventData = new HashMap<>();
        eventData.put("type", "organization.membership.created");
        Map<String, Object> data = new HashMap<>();
        data.put("membership", membership);
        eventData.put("data", data);

        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setEmail("admin@example.com");
        existingUser.setRole("USER");
        existingUser.setAuthType(AuthType.CLERK);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        // Act
        authService.handleClerkUserEvent(eventData);

        // Assert
        verify(userRepository).save(argThat(u -> "ADMIN".equals(u.getRole())));
    }

    @Test
    void handleClerkUserEvent_ShouldDemoteUser_OnOrganizationMembershipDeleted() {
        // Arrange
        Map<String, Object> emailAddress = new HashMap<>();
        emailAddress.put("email_address", "admin@example.com");

        Map<String, Object> userObj = new HashMap<>();
        userObj.put("email_addresses", java.util.List.of(emailAddress));

        Map<String, Object> membership = new HashMap<>();
        membership.put("role", "member");
        membership.put("user", userObj);

        Map<String, Object> eventData = new HashMap<>();
        eventData.put("type", "organization.membership.deleted");
        Map<String, Object> data = new HashMap<>();
        data.put("membership", membership);
        eventData.put("data", data);

        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setEmail("admin@example.com");
        existingUser.setRole("ADMIN");
        existingUser.setAuthType(AuthType.CLERK);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        // Act
        authService.handleClerkUserEvent(eventData);

        // Assert
        verify(userRepository).save(argThat(u -> "USER".equals(u.getRole())));
    }

    @Test
    void syncUserFromClerk_ShouldThrowException_WhenEmailAlreadyExistsForDifferentUser() {
        // Arrange
        String clerkId = "clerk_123";
        String newEmail = "existing@example.com";
        String firstName = "John";
        String lastName = "Doe";

        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setClerkId(clerkId);
        existingUser.setEmail("old@example.com");
        existingUser.setFirstName("Old");
        existingUser.setLastName("Name");
        existingUser.setAuthType(AuthType.CLERK);

        User userWithNewEmail = new User();
        userWithNewEmail.setId(2L);
        userWithNewEmail.setEmail(newEmail);
        userWithNewEmail.setAuthType(AuthType.CLERK);

        when(userRepository.findByClerkId(clerkId)).thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmail(newEmail)).thenReturn(Optional.of(userWithNewEmail));

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            authService.syncUserFromClerk(clerkId, newEmail, firstName, lastName);
        });

        assertTrue(exception.getMessage().contains("Cannot update user email"));
        assertTrue(exception.getMessage().contains(newEmail));
        assertTrue(exception.getMessage().contains("email already exists"));
        verify(userRepository, never()).save(any(User.class));
    }
}
