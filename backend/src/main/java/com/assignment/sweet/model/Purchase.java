package com.assignment.sweet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sweetId;

    @Column(nullable = false)
    private String sweetName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private java.math.BigDecimal pricePerUnit;

    @Column(nullable = false)
    private java.math.BigDecimal totalPrice;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = false)
    private LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
}
