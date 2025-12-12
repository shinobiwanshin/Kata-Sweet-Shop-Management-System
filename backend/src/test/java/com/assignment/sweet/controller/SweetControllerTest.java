package com.assignment.sweet.controller;

import com.assignment.sweet.model.Sweet;
import com.assignment.sweet.service.SweetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(SweetController.class)
class SweetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SweetService sweetService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void getAllSweets_ShouldReturnListOfSweets() throws Exception {
        Sweet sweet = new Sweet(1L, "Ladoo", "Traditional", BigDecimal.valueOf(10.0), 100, "Delicious Ladoo",
                "http://image.url");
        when(sweetService.getAllSweets()).thenReturn(List.of(sweet));

        mockMvc.perform(get("/api/sweets"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(jsonPath("$[0].name").value("Ladoo"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void addSweet_ShouldReturnSavedSweet() throws Exception {
        Sweet sweet = new Sweet(1L, "Barfi", "Milk", BigDecimal.valueOf(15.0), 50, "Tasty Barfi", "http://image.url");
        when(sweetService.addSweet(any(Sweet.class))).thenReturn(sweet);

        mockMvc.perform(post("/api/sweets")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sweet)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(jsonPath("$.name").value("Barfi"));
    }

    @Test
    @WithMockUser
    void purchaseSweet_ShouldReturnUpdatedSweet() throws Exception {
        Sweet sweet = new Sweet(1L, "Ladoo", "Traditional", BigDecimal.valueOf(10.0), 9, "Delicious Ladoo",
                "http://image.url");
        when(sweetService.purchaseSweet(1L)).thenReturn(sweet);

        mockMvc.perform(post("/api/sweets/1/purchase")
                .with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(jsonPath("$.quantity").value(9));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void restockSweet_ShouldReturnUpdatedSweet() throws Exception {
        Sweet sweet = new Sweet(1L, "Ladoo", "Traditional", BigDecimal.valueOf(10.0), 15, "Delicious Ladoo",
                "http://image.url");
        when(sweetService.restockSweet(1L, 5)).thenReturn(sweet);

        mockMvc.perform(post("/api/sweets/1/restock")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("5")) // Sending quantity as body
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(jsonPath("$.quantity").value(15));
    }
}
