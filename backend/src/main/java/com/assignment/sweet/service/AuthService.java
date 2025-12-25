package com.assignment.sweet.service;

import com.assignment.sweet.model.User;
import com.assignment.sweet.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.assignment.sweet.security.JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            com.assignment.sweet.security.JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Synchronize user from Clerk webhook
     */
    public User syncUserFromClerk(String clerkId, String email, String firstName, String lastName) {
        Optional<User> existingUser = userRepository.findByClerkId(clerkId);

        if (existingUser.isPresent()) {
            // Update existing user
            User user = existingUser.get();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            return userRepository.save(user);
        } else {
            // Check if user exists by email (migration case)
            Optional<User> userByEmail = userRepository.findByEmail(email);
            if (userByEmail.isPresent()) {
                // Migrate existing user to Clerk
                User user = userByEmail.get();
                user.setClerkId(clerkId);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                return userRepository.save(user);
            } else {
                // Create new user
                User user = new User();
                user.setClerkId(clerkId);
                user.setEmail(email);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setRole("USER"); // Default role
                return userRepository.save(user);
            }
        }
    }

    // Backwards-compatible registration for local testing (kept alongside Clerk)
    public User register(com.assignment.sweet.dto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        // Assign a local clerk id so DB not null constraint is satisfied across
        // environments
        user.setClerkId("local:" + java.util.UUID.randomUUID().toString());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : "USER");
        return userRepository.save(user);
    }

    public String login(com.assignment.sweet.dto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return jwtTokenProvider.generateToken(user);
    }

    /**
     * Handle Clerk user creation/update webhook
     */
    public void handleClerkUserEvent(Map<String, Object> eventData) {
        try {
            String eventType = (String) eventData.get("type");

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) eventData.get("data");

            // Handle user created/updated events
            if (data != null && ("user.created".equals(eventType) || "user.updated".equals(eventType))) {
                String clerkId = (String) data.get("id");
                String email = extractPrimaryEmail(data);
                String firstName = (String) data.get("first_name");
                String lastName = (String) data.get("last_name");

                if (clerkId != null && email != null) {
                    syncUserFromClerk(clerkId, email, firstName, lastName);
                    log.info("Successfully synced user from Clerk: {}", email);
                }
                return;
            }

            // Handle organization membership changes to reflect admin role for users
            if (eventType != null && (eventType.startsWith("organization") || eventType.contains("membership"))) {
                if (data != null) {
                    // membership may be under different keys depending on webhook - try common
                    // shapes
                    @SuppressWarnings("unchecked")
                    Map<String, Object> membership = (Map<String, Object>) data.get("membership");
                    if (membership == null) {
                        membership = (Map<String, Object>) data.get("member");
                    }
                    // Some payloads may include the user object directly
                    Map<String, Object> userObj = membership != null ? (Map<String, Object>) membership.get("user")
                            : null;
                    if (userObj == null) {
                        userObj = (Map<String, Object>) data.get("user");
                    }

                    final String roleVal;
                    if (membership != null && membership.get("role") != null) {
                        roleVal = (String) membership.get("role");
                    } else {
                        roleVal = (String) data.get("role");
                    }

                    final String emailVal;
                    if (userObj != null) {
                        emailVal = extractPrimaryEmail(userObj);
                    } else if (membership != null && membership.get("email") != null) {
                        emailVal = (String) membership.get("email");
                    } else {
                        emailVal = (String) data.get("email");
                    }

                    if (emailVal != null && roleVal != null) {
                        userRepository.findByEmail(emailVal).ifPresent(u -> {
                            boolean isAdmin = "admin".equalsIgnoreCase(roleVal) || "owner".equalsIgnoreCase(roleVal);
                            u.setRole(isAdmin ? "ADMIN" : "USER");
                            userRepository.save(u);
                            log.info("Updated user role from Clerk membership: {} -> {}", emailVal, u.getRole());
                        });
                    }
                }
            }

        } catch (Exception e) {
            log.error("Failed to handle Clerk user event", e);
        }
    }

    private String extractPrimaryEmail(Map<String, Object> userData) {
        try {
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> emailAddresses = (java.util.List<Map<String, Object>>) userData
                    .get("email_addresses");

            if (emailAddresses != null && !emailAddresses.isEmpty()) {
                for (Map<String, Object> emailAddr : emailAddresses) {
                    // Find the primary email
                    if (emailAddr != null && emailAddr.get("email_address") != null) {
                        return (String) emailAddr.get("email_address");
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract email from Clerk user data", e);
        }
        return null;
    }
}
