package com.assignment.sweet.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.JwkProviderBuilder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.assignment.sweet.model.User;
import com.assignment.sweet.repository.UserRepository;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;

@Slf4j
@Component
public class ClerkAuthenticationFilter extends OncePerRequestFilter {

    @Value("${clerk.secret-key:}")
    private String clerkSecretKey;

    @Value("${clerk.jwks-uri:}")
    private String jwksUri;

    private JwkProvider jwkProvider;

    private UserDetailsService userDetailsService;
    private UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public ClerkAuthenticationFilter(
            @org.springframework.beans.factory.annotation.Autowired(required = false) UserDetailsService userDetailsService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) UserRepository userRepository) {
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
    }

    // Backwards-compatible constructor for test contexts that may not provide a
    // UserRepository bean
    public ClerkAuthenticationFilter(UserDetailsService userDetailsService) {
        this(userDetailsService, null);
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            if (jwksUri != null && !jwksUri.isEmpty()) {
                jwkProvider = new JwkProviderBuilder(new URL(jwksUri)).build();
                // Note: verifier is built per-token in doFilterInternal since we need the
                // specific key
                log.info("JWKS provider initialized with URI: {}", jwksUri);
            } else {
                log.warn("JWKS URI not configured - JWT verification will be skipped (NOT SAFE FOR PRODUCTION)");
            }
        } catch (MalformedURLException e) {
            log.error("Invalid JWKS URI: {}", jwksUri, e);
        }
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            // Verify the JWT token with Clerk's public keys
            DecodedJWT decodedJWT;
            if (jwkProvider != null) {
                // Get the key ID from the token header
                String kid = JWT.decode(jwt).getKeyId();
                if (kid == null) {
                    throw new JWTVerificationException("Token missing 'kid' header");
                }

                // Get the public key for this key ID
                Jwk jwk = jwkProvider.get(kid);
                RSAPublicKey publicKey = (RSAPublicKey) jwk.getPublicKey();

                // Create algorithm with the correct public key
                Algorithm algorithm = Algorithm.RSA256(publicKey);

                // Extract issuer from JWKS URI (e.g.,
                // https://xxx.clerk.accounts.dev/.well-known/jwks.json ->
                // https://xxx.clerk.accounts.dev)
                String expectedIssuer = jwksUri.replace("/.well-known/jwks.json", "");

                // Verify the token with flexible issuer matching
                decodedJWT = JWT.require(algorithm)
                        .withIssuer(expectedIssuer)
                        .build()
                        .verify(jwt);
            } else {
                // Fallback to decode-only for development (NOT SECURE)
                log.warn("JWKS URI not configured - using insecure JWT decode only!");
                decodedJWT = JWT.decode(jwt);
            }

            // Basic validation - check if token is not expired
            java.util.Date expiresAt = decodedJWT.getExpiresAt();
            if (expiresAt != null && expiresAt.after(new java.util.Date()) &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                // Extract user information from the token
                String userId = decodedJWT.getSubject();
                String email = decodedJWT.getClaim("email").asString();
                String firstName = decodedJWT.getClaim("first_name").asString();
                String lastName = decodedJWT.getClaim("last_name").asString();

                // Log all claims for debugging
                log.debug("JWT claims for user {}: {}", userId, decodedJWT.getClaims().keySet());

                // Determine role from token claims (support several claim shapes)
                String role = "USER"; // default role

                // Check "o" claim - Clerk's organization claim (contains org membership info)
                try {
                    // The "o" claim in Clerk contains organization info when user is in an org
                    // Format: {id=org_xxx, rol=admin, slg=slug-name}
                    var oClaim = decodedJWT.getClaim("o");
                    if (!oClaim.isNull()) {
                        // Try to get as map (Clerk org claim format)
                        java.util.Map<String, Object> orgMap = oClaim.asMap();
                        if (orgMap != null) {
                            log.debug("JWT 'o' claim (org info): {}", orgMap);
                            // Clerk uses "rol" (not "role") for the role field
                            Object orgRole = orgMap.get("rol");
                            Object orgSlg = orgMap.get("slg"); // slug
                            Object orgPer = orgMap.get("per"); // permissions
                            log.debug("Org rol: {}, slug: {}, permissions: {}", orgRole, orgSlg, orgPer);

                            if (orgRole != null) {
                                String r = orgRole.toString().toLowerCase();
                                if (r.equals("admin") || r.equals("org:admin") || r.equals("owner")) {
                                    role = "ADMIN";
                                    log.debug("User granted ADMIN role via 'o.rol' claim");
                                }
                            }
                            // Also check permissions for admin
                            if (orgPer != null && orgPer.toString().contains("admin")) {
                                role = "ADMIN";
                                log.debug("User granted ADMIN role via org permissions");
                            }
                        }
                    }
                } catch (Exception e) {
                    log.debug("Failed to parse 'o' claim: {}", e.getMessage());
                }

                // 0) role claim as string (local JWTs use 'role')
                try {
                    String roleClaim = decodedJWT.getClaim("role").asString();
                    if (roleClaim != null
                            && (roleClaim.equalsIgnoreCase("admin") || roleClaim.equalsIgnoreCase("administrator"))) {
                        role = "ADMIN";
                    }
                } catch (Exception ignored) {
                }

                try {
                    // 1) roles claim as array
                    java.util.List<String> rolesClaim = decodedJWT.getClaim("roles").asList(String.class);
                    if (rolesClaim != null) {
                        for (String r : rolesClaim) {
                            if (r != null && r.equalsIgnoreCase("admin")) {
                                role = "ADMIN";
                                break;
                            }
                        }
                    }
                } catch (Exception ignored) {
                }

                // 2) org_role claim (Clerk's standard claim for current org role)
                try {
                    String orgRole = decodedJWT.getClaim("org_role").asString();
                    log.debug("JWT org_role claim: {}", orgRole);
                    if (orgRole != null) {
                        String r = orgRole.toLowerCase();
                        if (r.equals("admin") || r.equals("org:admin") || r.equals("owner")) {
                            role = "ADMIN";
                            log.debug("User granted ADMIN role via org_role claim");
                        }
                    }
                } catch (Exception ignored) {
                }

                // 2b) org_roles or organization_roles claim (array form)
                try {
                    java.util.List<String> orgRoles = decodedJWT.getClaim("org_roles").asList(String.class);
                    if (orgRoles == null)
                        orgRoles = decodedJWT.getClaim("organization_roles").asList(String.class);
                    if (orgRoles != null) {
                        for (String r : orgRoles) {
                            if (r != null) {
                                String rl = r.toLowerCase();
                                if (rl.equals("admin") || rl.equals("org:admin") || rl.equals("owner")) {
                                    role = "ADMIN";
                                    break;
                                }
                            }
                        }
                    }
                } catch (Exception ignored) {
                }

                // 3) public_metadata.role if Clerk uses public meta for role
                try {
                    java.util.Map<String, Object> publicMeta = decodedJWT.getClaim("public_metadata").asMap();
                    if (publicMeta != null && publicMeta.get("role") != null) {
                        String rm = publicMeta.get("role").toString();
                        if (rm.equalsIgnoreCase("admin") || rm.equalsIgnoreCase("administrator")) {
                            role = "ADMIN";
                        }
                    }
                } catch (Exception ignored) {
                }

                log.debug("Final role for user {}: {}", email, role);

                // Use email as username for compatibility
                String username = email != null ? email : userId;

                // Upsert user in local DB so we have clerkId and role stored (if repository
                // available)
                try {
                    if (userRepository != null) {
                        User user = null;
                        if (userId != null && !userId.isEmpty()) {
                            user = userRepository.findByClerkId(userId).orElse(null);
                        }
                        if (user == null && username != null) {
                            user = userRepository.findByEmail(username).orElse(null);
                        }
                        if (user == null) {
                            // Create new user
                            User newUser = new User();
                            newUser.setClerkId(userId);
                            newUser.setEmail(username);
                            newUser.setFirstName(firstName);
                            newUser.setLastName(lastName);
                            newUser.setRole(role);
                            user = userRepository.save(newUser);
                        } else {
                            boolean changed = false;
                            if (user.getClerkId() == null && userId != null) {
                                user.setClerkId(userId);
                                changed = true;
                            }
                            if (user.getRole() == null || !user.getRole().equals(role)) {
                                user.setRole(role);
                                changed = true;
                            }
                            if (firstName != null && !firstName.equals(user.getFirstName())) {
                                user.setFirstName(firstName);
                                changed = true;
                            }
                            if (lastName != null && !lastName.equals(user.getLastName())) {
                                user.setLastName(lastName);
                                changed = true;
                            }
                            if (changed) {
                                userRepository.save(user);
                            }
                        }
                    } else {
                        log.debug("UserRepository not available in context; skipping user sync");
                    }
                } catch (Exception e) {
                    log.warn("Failed to sync user to DB", e);
                }

                // If UserDetailsService is not available in this context, skip creating auth
                if (userDetailsService == null) {
                    log.debug("UserDetailsService not available; skipping authentication");
                    filterChain.doFilter(request, response);
                    return;
                }
                // Create UserDetails
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Create authentication token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            log.error("Failed to authenticate with Clerk token", e);
            // Continue with filter chain - authentication will fail downstream
        }

        filterChain.doFilter(request, response);
    }
}
