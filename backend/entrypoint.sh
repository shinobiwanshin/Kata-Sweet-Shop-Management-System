#!/bin/sh

# Function to parse and export JDBC properties from a postgres:// URL
parse_and_export() {
    local url="$1"
    
    # Remove protocol (postgres:// or postgresql://)
    local no_proto=$(echo "$url" | sed -E 's/^postgres(ql)?:\/\///')
    
    # Check if credentials exist (contains @)
    if echo "$no_proto" | grep -q "@"; then
        # Extract credentials part (before the last @)
        local creds=$(echo "$no_proto" | sed 's/@.*//')
        
        # Extract host/db part (after the last @)
        local host_db=$(echo "$no_proto" | sed 's/.*@//')
        
        # Extract user and password
        local user=$(echo "$creds" | cut -d: -f1)
        local pass=$(echo "$creds" | cut -d: -f2-)
        
        # Export separate properties
        export SPRING_DATASOURCE_USERNAME="$user"
        export SPRING_DATASOURCE_PASSWORD="$pass"
        export SPRING_DATASOURCE_URL="jdbc:postgresql://$host_db"
        
        echo "Extracted username and password from URL"
        echo "Set SPRING_DATASOURCE_URL to jdbc:postgresql://$host_db"
    else
        # No credentials, just replace protocol
        export SPRING_DATASOURCE_URL="jdbc:postgresql://$no_proto"
        echo "Set SPRING_DATASOURCE_URL to jdbc:postgresql://$no_proto"
    fi
}

# Check SPRING_DATASOURCE_URL first
if [ -n "$SPRING_DATASOURCE_URL" ]; then
    echo "Processing SPRING_DATASOURCE_URL..."
    if echo "$SPRING_DATASOURCE_URL" | grep -qE "^postgres(ql)?://"; then
        parse_and_export "$SPRING_DATASOURCE_URL"
    fi
# Fallback to DATABASE_URL if SPRING_DATASOURCE_URL is not set
elif [ -n "$DATABASE_URL" ]; then
    echo "Processing DATABASE_URL..."
    if echo "$DATABASE_URL" | grep -qE "^postgres(ql)?://"; then
        parse_and_export "$DATABASE_URL"
    fi
fi

# Execute the application
exec java -jar app.jar
