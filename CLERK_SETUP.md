# Clerk Authentication Integration

This project has been updated to use Clerk for authentication instead of the custom JWT implementation.

## Setup Instructions

### 1. Create a Clerk Application

1. Go to [Clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Choose your authentication methods (email/password, social logins, etc.)

### 2. Configure Environment Variables

#### Backend (.env or environment variables)

```bash
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

Get your Clerk secret key from the Clerk dashboard under "API Keys".

#### Frontend (.env)

```bash
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

Get your Clerk publishable key from the Clerk dashboard under "API Keys".

### 3. Configure Clerk Webhooks (Optional)

If you want automatic user synchronization, set up a webhook in Clerk:

1. In Clerk dashboard, go to "Webhooks"
2. Add a new webhook with URL: `https://your-domain.com/api/auth/clerk/webhook`
3. Select events: `user.created`, `user.updated`
4. Copy the webhook secret and add it to your environment if needed

### 4. Database Migration

The User model has been updated to work with Clerk. Run your database migration to update the schema:

```sql
-- Add new columns to users table
ALTER TABLE users ADD COLUMN clerk_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN first_name VARCHAR(255);
ALTER TABLE users ADD COLUMN last_name VARCHAR(255);

-- Migrate existing users (if any)
UPDATE users SET clerk_id = CONCAT('migrated_', id) WHERE clerk_id IS NULL;
```

### 5. User Roles

By default, all users are assigned the "USER" role. To assign admin roles:

1. In Clerk dashboard, go to "Users"
2. Edit a user and add custom metadata: `{"role": "ADMIN"}`
3. Or update the database directly: `UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';`

## How It Works

### Backend Changes

- **ClerkAuthenticationFilter**: Replaces JWT authentication with Clerk token validation
- **User Model**: Updated to store Clerk user ID instead of passwords
- **AuthService**: Handles user synchronization from Clerk webhooks
- **AuthController**: Provides webhook endpoint for Clerk events

### Frontend Changes

- **App.js**: Wrapped with ClerkProvider
- **AuthContext**: Updated to work with Clerk's authentication state
- **Login/Register Pages**: Now use Clerk's SignIn and SignUp components
- **API Interceptor**: Automatically includes Clerk tokens in requests

## Security Notes

⚠️ **Important**: The current implementation uses basic JWT decoding without cryptographic verification. For production, you should implement proper JWT verification using Clerk's public keys from the JWKS endpoint.

To implement proper verification:

1. Fetch Clerk's public keys from `https://your-domain.clerk.accounts.dev/.well-known/jwks.json`
2. Verify JWT signatures using RS256 algorithm
3. Validate issuer and other claims

## Testing

1. Start the backend: `./mvnw spring-boot:run`
2. Start the frontend: `npm start`
3. Try logging in with Clerk authentication
4. Test protected routes and admin functionality

## Migration from Custom JWT

If you have existing users, they will need to:

1. Reset their passwords through Clerk
2. Or migrate their accounts by matching emails

The system will automatically create user records in your database when they first sign in with Clerk.
