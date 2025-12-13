#!/bin/sh

# Fix SPRING_DATASOURCE_URL if it starts with postgres:// or postgresql://
if [ -n "$SPRING_DATASOURCE_URL" ]; then
  echo "Checking SPRING_DATASOURCE_URL..."
  if echo "$SPRING_DATASOURCE_URL" | grep -q "^postgres://"; then
    export SPRING_DATASOURCE_URL=$(echo "$SPRING_DATASOURCE_URL" | sed 's/^postgres:\/\//jdbc:postgresql:\/\//')
    echo "Fixed SPRING_DATASOURCE_URL to JDBC format"
  elif echo "$SPRING_DATASOURCE_URL" | grep -q "^postgresql://"; then
    export SPRING_DATASOURCE_URL=$(echo "$SPRING_DATASOURCE_URL" | sed 's/^postgresql:\/\//jdbc:postgresql:\/\//')
    echo "Fixed SPRING_DATASOURCE_URL to JDBC format"
  fi
fi

# Also handle DATABASE_URL if present and SPRING_DATASOURCE_URL is not set
if [ -z "$SPRING_DATASOURCE_URL" ] && [ -n "$DATABASE_URL" ]; then
  echo "Setting SPRING_DATASOURCE_URL from DATABASE_URL..."
  if echo "$DATABASE_URL" | grep -q "^postgres://"; then
    export SPRING_DATASOURCE_URL=$(echo "$DATABASE_URL" | sed 's/^postgres:\/\//jdbc:postgresql:\/\//')
  elif echo "$DATABASE_URL" | grep -q "^postgresql://"; then
    export SPRING_DATASOURCE_URL=$(echo "$DATABASE_URL" | sed 's/^postgresql:\/\//jdbc:postgresql:\/\//')
  else
    export SPRING_DATASOURCE_URL="$DATABASE_URL"
  fi
  echo "Created SPRING_DATASOURCE_URL from DATABASE_URL"
fi

# Execute the application
exec java -jar app.jar
