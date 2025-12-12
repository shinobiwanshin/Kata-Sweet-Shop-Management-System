package com.assignment.sweet.integration;

import com.assignment.sweet.dto.LoginRequest;
import com.assignment.sweet.dto.RegisterRequest;
import com.assignment.sweet.model.Sweet;
import com.assignment.sweet.repository.PurchaseRepository;
import com.assignment.sweet.repository.SweetRepository;
import com.assignment.sweet.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PurchaseIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private SweetRepository sweetRepository;

        @Autowired
        private PurchaseRepository purchaseRepository;

        @BeforeEach
        void setUp() {
                purchaseRepository.deleteAll();
                sweetRepository.deleteAll();
                userRepository.deleteAll();
        }

        @Test
        void purchaseFlow_ShouldSucceed() throws Exception {
                // 1. Register Admin
                RegisterRequest adminRegister = new RegisterRequest("admin@test.com", "password", "ADMIN");
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(adminRegister)))
                                .andExpect(status().isOk());

                // 2. Login Admin
                LoginRequest adminLogin = new LoginRequest("admin@test.com", "password");
                MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(adminLogin)))
                                .andExpect(status().isOk())
                                .andReturn();

                String adminToken = objectMapper.readTree(adminLoginResult.getResponse().getContentAsString())
                                .get("token")
                                .asText();

                // 3. Add Sweet (as Admin)
                Sweet sweet = new Sweet(null, "Test Sweet", "Test Category", BigDecimal.valueOf(10.0), 100,
                                "Description",
                                "http://url");
                MockMultipartFile sweetPart = new MockMultipartFile("sweet", "", "application/json",
                                objectMapper.writeValueAsBytes(sweet));

                MvcResult addSweetResult = mockMvc.perform(multipart("/api/sweets")
                                .file(sweetPart)
                                .header("Authorization", "Bearer " + adminToken)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isOk())
                                .andReturn();

                Sweet savedSweet = objectMapper.readValue(addSweetResult.getResponse().getContentAsString(),
                                Sweet.class);

                // 4. Register User
                RegisterRequest userRegister = new RegisterRequest("user@test.com", "password", "USER");
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(userRegister)))
                                .andExpect(status().isOk());

                // 5. Login User
                LoginRequest userLogin = new LoginRequest("user@test.com", "password");
                MvcResult userLoginResult = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(userLogin)))
                                .andExpect(status().isOk())
                                .andReturn();

                String userToken = objectMapper.readTree(userLoginResult.getResponse().getContentAsString())
                                .get("token")
                                .asText();

                // 6. Purchase Sweet (as User) - Quantity 5
                int quantity = 5;
                mockMvc.perform(post("/api/sweets/" + savedSweet.getId() + "/purchase")
                                .header("Authorization", "Bearer " + userToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(String.valueOf(quantity)))
                                .andExpect(status().isOk());

                // 7. Verify Purchase and Stock
                Sweet updatedSweet = sweetRepository.findById(savedSweet.getId()).orElseThrow();
                assertEquals(95, updatedSweet.getQuantity());

                assertEquals(1, purchaseRepository.count());
                var purchase = purchaseRepository.findAll().get(0);
                assertEquals(quantity, purchase.getQuantity());
                assertEquals(0, BigDecimal.valueOf(50.0).compareTo(purchase.getTotalPrice()));
        }
}
