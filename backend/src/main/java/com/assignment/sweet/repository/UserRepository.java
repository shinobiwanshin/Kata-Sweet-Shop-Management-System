package com.assignment.sweet.repository;

import com.assignment.sweet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByClerkId(String clerkId);

    boolean existsByEmail(String email);

    boolean existsByClerkId(String clerkId);
}
