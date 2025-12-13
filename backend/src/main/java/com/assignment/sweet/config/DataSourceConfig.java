package com.assignment.sweet.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;

/**
 * Custom DataSource configuration for Render deployment.
 * Only active when DATABASE_URL environment variable is set.
 * Handles conversion of DATABASE_URL (postgres://...) to JDBC format
 * (jdbc:postgresql://...).
 */
@Configuration
@ConditionalOnProperty(name = "DATABASE_URL")
public class DataSourceConfig {

    private final Environment env;

    public DataSourceConfig(Environment env) {
        this.env = env;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = env.getProperty("DATABASE_URL");

        HikariDataSource dataSource = new HikariDataSource();

        // Parse Render's DATABASE_URL (postgres://user:pass@host:port/db)
        String[] parsed = parsePostgresUrl(databaseUrl);

        dataSource.setJdbcUrl(parsed[0]);
        dataSource.setUsername(parsed[1]);
        dataSource.setPassword(parsed[2]);
        dataSource.setDriverClassName("org.postgresql.Driver");

        return dataSource;
    }

    /**
     * Parses a Postgres URL and returns [jdbcUrl, username, password]
     */
    private String[] parsePostgresUrl(String url) {
        if (url == null || url.isEmpty()) {
            return new String[] { "jdbc:postgresql://localhost:5432/sweetshop", "postgres", "postgres" };
        }

        String jdbcUrl;
        String username = "postgres";
        String password = "postgres";

        // Remove protocol prefix
        String processedUrl = url;
        if (processedUrl.startsWith("postgres://")) {
            processedUrl = processedUrl.substring("postgres://".length());
        } else if (processedUrl.startsWith("postgresql://")) {
            processedUrl = processedUrl.substring("postgresql://".length());
        }

        // Extract credentials if present: user:pass@host:port/db
        if (processedUrl.contains("@")) {
            String[] parts = processedUrl.split("@", 2);
            String credentials = parts[0];
            String hostPart = parts[1];

            if (credentials.contains(":")) {
                String[] credParts = credentials.split(":", 2);
                username = credParts[0];
                password = credParts[1];
            } else {
                username = credentials;
            }

            jdbcUrl = "jdbc:postgresql://" + hostPart;
        } else {
            jdbcUrl = "jdbc:postgresql://" + processedUrl;
        }

        return new String[] { jdbcUrl, username, password };
    }
}
