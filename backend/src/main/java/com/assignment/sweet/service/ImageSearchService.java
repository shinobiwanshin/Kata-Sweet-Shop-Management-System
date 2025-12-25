package com.assignment.sweet.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ImageSearchService {

    @Value("${unsplash.access-key}")
    private String accessKey;

    private final RestTemplate restTemplate;

    public ImageSearchService(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
    }

    public List<String> searchImages(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String url = UriComponentsBuilder.fromHttpUrl("https://api.unsplash.com/search/photos")
                .queryParam("query", query.trim())
                .queryParam("per_page", 12)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Client-ID " + accessKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && body.containsKey("results")) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("results");
                return results.stream()
                    .map(result -> {
                        Map<String, String> urls = (Map<String, String>) result.get("urls");
                        return urls.get("regular");
                    })
                    .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("Failed to search images from Unsplash", e);
        }

        return Collections.emptyList();
    }
}
