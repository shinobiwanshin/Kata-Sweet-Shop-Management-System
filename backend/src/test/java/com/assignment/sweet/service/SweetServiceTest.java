package com.assignment.sweet.service;

import com.assignment.sweet.model.Sweet;
import com.assignment.sweet.repository.SweetRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SweetServiceTest {

    @Mock
    private SweetRepository sweetRepository;

    @Mock
    private com.assignment.sweet.repository.PurchaseRepository purchaseRepository;

    @InjectMocks
    private SweetService sweetService;

    @Test
    void getAllSweets_ShouldReturnListOfSweets() {
        // Arrange
        Sweet sweet = new Sweet(1L, "Ladoo", "Traditional", BigDecimal.valueOf(10.0), 100, "Delicious Ladoo",
                "http://image.url");
        when(sweetRepository.findAll()).thenReturn(List.of(sweet));

        // Act
        List<Sweet> result = sweetService.getAllSweets();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Ladoo", result.get(0).getName());
    }

    @Test
    void addSweet_ShouldSaveSweet() {
        // Arrange
        Sweet sweet = new Sweet(null, "Barfi", "Milk", BigDecimal.valueOf(15.0), 50, "Tasty Barfi", "http://image.url");
        when(sweetRepository.save(any(Sweet.class))).thenAnswer(invocation -> {
            Sweet s = invocation.getArgument(0);
            s.setId(1L);
            return s;
        });

        // Act
        Sweet result = sweetService.addSweet(sweet, null);

        // Assert
        assertNotNull(result.getId());
        assertEquals("Barfi", result.getName());
    }

    @Test
    void purchaseSweet_ShouldDecreaseQuantity_WhenStockIsAvailable() {
        // Arrange
        Sweet sweet = new Sweet(1L, "Ladoo", "Traditional", BigDecimal.valueOf(10.0), 10, "Delicious Ladoo",
                "http://image.url");
        when(sweetRepository.findById(1L)).thenReturn(Optional.of(sweet));
        when(sweetRepository.save(any(Sweet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Sweet result = sweetService.purchaseSweet(1L, 1, "test@example.com");

        // Assert
        assertEquals(9, result.getQuantity());
        verify(purchaseRepository, times(1)).save(any(com.assignment.sweet.model.Purchase.class));
    }

    @Test
    void purchaseSweet_ShouldThrowException_WhenStockIsInsufficient() {
        // Arrange
        Sweet sweet = new Sweet(1L, "Ladoo", "Traditional", BigDecimal.valueOf(10.0), 0, "Delicious Ladoo",
                "http://image.url");
        when(sweetRepository.findById(1L)).thenReturn(Optional.of(sweet));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> sweetService.purchaseSweet(1L, 1, "test@example.com"));
    }

    @Test
    void restockSweet_ShouldIncreaseQuantity() {
        // Arrange
        Sweet sweet = new Sweet(1L, "Ladoo", "Traditional", BigDecimal.valueOf(10.0), 10, "Delicious Ladoo",
                "http://image.url");
        when(sweetRepository.findById(1L)).thenReturn(Optional.of(sweet));
        when(sweetRepository.save(any(Sweet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Sweet result = sweetService.restockSweet(1L, 5);

        // Assert
        assertEquals(15, result.getQuantity());
    }
}
