package com.assignment.sweet.repository;

import com.assignment.sweet.model.Sweet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SweetRepository extends JpaRepository<Sweet, Long> {
}
