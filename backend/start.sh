#!/bin/bash
# Backend startup script for automated evaluation

# Check if we're already in backend directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Make sure to run this script from the backend directory."
    exit 1
fi

# Install dependencies
npm install

# Start in background
npm run start:bg

echo "Backend started in background"
echo "Health check: http://localhost:8080/health"
echo "API endpoint: http://localhost:8080/api"
echo "Swagger UI: http://localhost:8080/swagger-ui"
