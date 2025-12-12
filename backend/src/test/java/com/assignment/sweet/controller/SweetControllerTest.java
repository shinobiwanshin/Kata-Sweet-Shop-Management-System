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
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
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

    @MockBean
    private com.assignment.sweet.security.JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.assignment.sweet.security.JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @org.junit.jupiter.api.BeforeEach
    void setUp() throws Exception {
        org.mockito.Mockito.doAnswer(invocation -> {
            jakarta.servlet.ServletRequest request = invocation.getArgument(0);
            jakarta.servlet.ServletResponse response = invocation.getArgument(1);
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

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
        when(sweetService.addSweet(any(Sweet.class), any())).thenReturn(sweet);

        org.springframework.mock.web.MockMultipartFile sweetPart = new org.springframework.mock.web.MockMultipartFile(
                "sweet",
                "",
                "application/json",
                objectMapper.writeValueAsBytes(sweet));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart("/api/sweets")
                .file(sweetPart)
                .with(csrf())
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(jsonPath("$.name").value("Barfi"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void purchaseSweet_ShouldReturnUpdatedSweet() throws Exception {
        Sweet sweet = new Sweet(1L, "Ladoo", "Traditional", BigDecimal.valueOf(10.0), 9, "Delicious Ladoo",
                "http://image.url");
        when(sweetService.purchaseSweet(eq(1L), anyInt(), eq("test@example.com"))).thenReturn(sweet);

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
