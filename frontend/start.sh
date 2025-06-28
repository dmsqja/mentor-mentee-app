#!/bin/bash
# Frontend startup script for automated evaluation

# Check if we're already in frontend directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Make sure to run this script from the frontend directory."
    exit 1
fi

# Install dependencies
npm install

# Start in background
npm run start:bg

echo "Frontend started in background"
echo "App URL: http://localhost:3000"
