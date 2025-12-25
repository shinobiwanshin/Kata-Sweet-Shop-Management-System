package com.assignment.sweet.service;

import com.assignment.sweet.model.Sweet;
import com.assignment.sweet.repository.SweetRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class SweetService {

    private final SweetRepository sweetRepository;
    private final ImageService imageService;
    private final com.assignment.sweet.repository.PurchaseRepository purchaseRepository;

    public SweetService(SweetRepository sweetRepository, ImageService imageService,
            com.assignment.sweet.repository.PurchaseRepository purchaseRepository) {
        this.sweetRepository = sweetRepository;
        this.imageService = imageService;
        this.purchaseRepository = purchaseRepository;
    }

    public List<Sweet> getAllSweets() {
        return sweetRepository.findAll();
    }

    public Sweet addSweet(Sweet sweet, org.springframework.web.multipart.MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = imageService.storeFile(imageFile);
            // Assuming the server runs on localhost:8080. In prod, this should be
            // configurable.
            sweet.setImageUrl("http://localhost:8080/uploads/" + fileName);
        }
        return sweetRepository.save(sweet);
    }

    public Sweet purchaseSweet(Long id, Integer quantity, String customerEmail) {
        log.debug("Purchasing {} sweet(s) {} for user: {}", quantity, id, customerEmail);
        Sweet sweet = sweetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sweet not found"));

        if (sweet.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        sweet.setQuantity(sweet.getQuantity() - quantity);
        Sweet savedSweet = sweetRepository.save(sweet);

        // Record purchase
        com.assignment.sweet.model.Purchase purchase = new com.assignment.sweet.model.Purchase();
        purchase.setSweetId(savedSweet.getId());
        purchase.setSweetName(savedSweet.getName());
        purchase.setQuantity(quantity);
        purchase.setPricePerUnit(savedSweet.getPrice());
        purchase.setTotalPrice(savedSweet.getPrice().multiply(java.math.BigDecimal.valueOf(quantity)));
        purchase.setCustomerEmail(customerEmail);
        purchaseRepository.save(purchase);
        log.debug("Purchase saved for {}", customerEmail);

        return savedSweet;
    }

    public Sweet restockSweet(Long id, Integer quantity) {
        Sweet sweet = sweetRepository.findById(id).orElseThrow(() -> new RuntimeException("Sweet not found"));
        sweet.setQuantity(sweet.getQuantity() + quantity);
        return sweetRepository.save(sweet);
    }

    public Sweet updateSweet(Long id, Sweet sweetDetails, org.springframework.web.multipart.MultipartFile imageFile) {
        Sweet sweet = sweetRepository.findById(id).orElseThrow(() -> new RuntimeException("Sweet not found"));
        sweet.setName(sweetDetails.getName());
        sweet.setCategory(sweetDetails.getCategory());
        sweet.setPrice(sweetDetails.getPrice());
        sweet.setQuantity(sweetDetails.getQuantity());
        sweet.setDescription(sweetDetails.getDescription());

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = imageService.storeFile(imageFile);
            sweet.setImageUrl("http://localhost:8080/uploads/" + fileName);
        } else if (sweetDetails.getImageUrl() != null) {
            // If no new file, but URL is provided (e.g. keeping existing), update it.
            // However, usually we just keep existing if null.
            // But if user explicitly clears it? Let's assume if URL is passed, use it.
            sweet.setImageUrl(sweetDetails.getImageUrl());
        }

        return sweetRepository.save(sweet);
    }

    public void deleteSweet(Long id) {
        Sweet sweet = sweetRepository.findById(id).orElseThrow(() -> new RuntimeException("Sweet not found"));
        sweetRepository.delete(sweet);
    }
}
