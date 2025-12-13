package com.assignment.sweet.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Converts DATABASE_URL (postgres://...) to JDBC format (jdbc:postgresql://...) for Render compatibility.
 * 
 * Render provides PostgreSQL URLs in postgres:// format, but Spring JDBC requires jdbc:postgresql://.
 * This processor runs before Spring Boot configures the datasource.
 */
public class DatabaseUrlProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = environment.getProperty("DATABASE_URL");
        
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            Map<String, Object> props = new HashMap<>();
            
            // Convert postgres://user:pass@host:port/db to jdbc:postgresql://host:port/db
            String jdbcUrl = convertToJdbcUrl(databaseUrl);
            props.put("spring.datasource.url", jdbcUrl);
            
            // Extract user and password from URL if present
            if (databaseUrl.contains("@") && databaseUrl.contains("://")) {
                String afterProtocol = databaseUrl.split("://")[1];
                if (afterProtocol.contains("@")) {
                    String credentials = afterProtocol.split("@")[0];
                    if (credentials.contains(":")) {
                        String[] parts = credentials.split(":", 2);
                        props.put("spring.datasource.username", parts[0]);
                        props.put("spring.datasource.password", parts[1]);
                    }
                }
            }
            
            // Add as the first property source to override everything else
            environment.getPropertySources().addFirst(
                new MapPropertySource("renderDatabaseUrlProps", props)
            );
        }
    }

    private String convertToJdbcUrl(String databaseUrl) {
        // Handle postgres:// or postgresql:// URLs
        String url = databaseUrl;
        
        if (url.startsWith("postgres://")) {
            url = url.replace("postgres://", "jdbc:postgresql://");
        } else if (url.startsWith("postgresql://")) {
            url = url.replace("postgresql://", "jdbc:postgresql://");
        }
        
        // If URL contains user:pass@, strip it out (Spring uses separate properties)
        if (url.contains("@") && url.startsWith("jdbc:postgresql://")) {
            String prefix = "jdbc:postgresql://";
            String afterPrefix = url.substring(prefix.length());
            if (afterPrefix.contains("@")) {
                String hostAndDb = afterPrefix.substring(afterPrefix.indexOf("@") + 1);
                url = prefix + hostAndDb;
            }
        }
        
        return url;
    }
}
