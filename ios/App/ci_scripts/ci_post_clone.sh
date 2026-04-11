#!/bin/sh

# Fail on error
set -e

# Use the absolute path provided by Xcode Cloud to find the project root
echo "Building Guri24 for Xcode Cloud..."
cd "$CI_PRIMARY_REPOSITORY_PATH"

# Install Node.js dependencies
echo "Installing JS dependencies..."
npm install

# Build the web application
echo "Building web app (Vite)..."
npm run build

# Synchronize assets into the native iOS project
# This step creates the missing 'public' folder and updates capacitor.config.json references
echo "Running Capacitor Sync..."
npx cap sync ios

echo "CI Post-Clone Setup Complete!"
