package com.assignment.sweet.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * User entity supporting dual authentication modes: Clerk (external) and Local
 * (internal).
 *
 * INVARIANTS ENFORCED:
 * - CLERK users: password must be null/empty, clerkId must be non-null
 * - LOCAL users: password must be non-null/non-empty, clerkId must be null
 *
 * These invariants are validated in PrePersist/PreUpdate lifecycle hooks.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private String clerkId; // Clerk user ID (non-null for CLERK auth, null for LOCAL auth)

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true) // Nullable for migration compatibility - validated in PrePersist/PreUpdate
    private AuthType authType; // Discriminator: CLERK or LOCAL

    @Column(nullable = false)
    private String role; // USER, ADMIN

    @Column
    private String firstName;

    @Column
    private String lastName;

    @Column
    private String password; // Non-null for LOCAL auth, null for CLERK auth

    /**
     * Validates authentication invariants before persisting/updating.
     * Ensures CLERK users have no password and LOCAL users have passwords.
     */
    @PrePersist
    @PreUpdate
    private void validateAuthInvariants() {
        if (authType == null) {
            throw new IllegalStateException("authType must be specified");
        }

        switch (authType) {
            case CLERK:
                // CLERK users must have clerkId and no password
                if (clerkId == null || clerkId.trim().isEmpty()) {
                    throw new IllegalStateException("CLERK users must have a non-empty clerkId");
                }
                if (password != null && !password.trim().isEmpty()) {
                    throw new IllegalStateException("CLERK users must not have a password");
                }
                break;

            case LOCAL:
                // LOCAL users must have password and no clerkId
                if (password == null || password.trim().isEmpty()) {
                    throw new IllegalStateException("LOCAL users must have a non-empty password");
                }
                if (clerkId != null && !clerkId.trim().isEmpty()) {
                    throw new IllegalStateException("LOCAL users must not have a clerkId");
                }
                break;
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return password; // CLERK users return null, LOCAL users return hashed password
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
