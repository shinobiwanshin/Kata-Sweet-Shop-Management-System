package com.assignment.sweet.controller;

import com.assignment.sweet.model.Purchase;
import com.assignment.sweet.repository.PurchaseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseRepository purchaseRepository;

    public PurchaseController(PurchaseRepository purchaseRepository) {
        this.purchaseRepository = purchaseRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Purchase>> getMyPurchases(Authentication authentication) {
        String email = authentication.getName();
        System.out.println("DEBUG: Fetching purchases for user: " + email);
        List<Purchase> purchases = purchaseRepository.findByCustomerEmailOrderByCreatedDateDesc(email);
        System.out.println("DEBUG: Found " + purchases.size() + " purchases for " + email);
        return ResponseEntity.ok(purchases);
    }

    @GetMapping("/all")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Purchase>> getAllPurchases() {
        return ResponseEntity.ok(purchaseRepository.findAll());
    }
}
