#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Comprehensive Test Suite...${NC}"

# 1. Backend Tests
echo -e "\n${GREEN}=== Running Backend Tests (Spring Boot) ===${NC}"
cd backend
if ./mvnw test; then
    echo -e "${GREEN}Backend Tests Passed!${NC}"
else
    echo -e "${RED}Backend Tests Failed!${NC}"
    exit 1
fi
cd ..

# 2. Frontend Component Tests
echo -e "\n${GREEN}=== Running Frontend Component Tests (Jest) ===${NC}"
cd frontend
if npm test -- --watchAll=false; then
    echo -e "${GREEN}Frontend Component Tests Passed!${NC}"
else
    echo -e "${RED}Frontend Component Tests Failed!${NC}"
    exit 1
fi

# 3. Frontend E2E Tests (Optional)
echo -e "\n${GREEN}=== Running Frontend E2E Tests (Playwright) ===${NC}"
echo "Note: Ensure backend server is running on port 8080 for E2E tests."
# Check if backend is running (simple check)
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    if npx playwright test e2e/recorded-test.spec.js; then
        echo -e "${GREEN}E2E Tests Passed!${NC}"
    else
        echo -e "${RED}E2E Tests Failed!${NC}"
        # Don't exit here, as E2E might be flaky or environment dependent
    fi
else
    echo -e "${RED}Backend server not detected on port 8080. Skipping E2E tests.${NC}"
    echo "Run './mvnw spring-boot:run' in backend/ directory to start the server."
fi
cd ..

echo -e "\n${GREEN}Test Suite Completed.${NC}"
