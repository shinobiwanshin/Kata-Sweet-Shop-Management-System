-- Partial unique index for clerk_id to enforce uniqueness only for non-null values
-- This solves portability issues across different databases
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id_unique
ON users(clerk_id)
WHERE clerk_id IS NOT NULL;

-- Ensure auth_type column exists (added for dual-auth support)
-- This will be handled by Hibernate DDL for new deployments