package com.assignment.sweet.model;

/**
 * Authentication type discriminator for dual-auth strategy.
 * Determines whether a user authenticates via Clerk or local credentials.
 */
public enum AuthType {
    /**
     * User authenticates via Clerk (external identity provider).
     * Password field must be null/empty.
     */
    CLERK,

    /**
     * User authenticates with local credentials.
     * Password field must be non-null and non-empty.
     */
    LOCAL
}