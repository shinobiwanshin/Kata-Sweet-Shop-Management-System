package com.assignment.sweet.repository;

import com.assignment.sweet.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByCustomerEmailOrderByCreatedDateDesc(String customerEmail);
}
