#!/bin/bash

# Cookie-Licking Detector - Development Setup Script
echo "🍪 Setting up Cookie-Licking Detector..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the stale-spotter directory."
    exit 1
fi

# Try to fix npm cache permissions
echo "🔧 Attempting to fix npm cache permissions..."
npm config set cache ~/.npm-cache 2>/dev/null || true

# Install dependencies with different strategies
echo "📦 Installing dependencies..."

# Strategy 1: Try with --force
if npm install --force 2>/dev/null; then
    echo "✅ Dependencies installed successfully!"
elif npm install --no-cache 2>/dev/null; then
    echo "✅ Dependencies installed successfully!"
elif npm install --legacy-peer-deps --no-optional 2>/dev/null; then
    echo "✅ Dependencies installed successfully!"
else
    echo "⚠️  npm install failed. Trying alternative approach..."
    
    # Create a temporary package-lock.json
    rm -f package-lock.json 2>/dev/null || true
    
    # Try installing without lock file
    if npm install --no-package-lock 2>/dev/null; then
        echo "✅ Dependencies installed successfully!"
    else
        echo "❌ Unable to install dependencies. Please try manually:"
        echo "   1. Delete node_modules folder: rm -rf node_modules"
        echo "   2. Delete package-lock.json: rm -f package-lock.json"
        echo "   3. Try: npm install --force"
        echo "   4. Or use: npm install --legacy-peer-deps"
        exit 1
    fi
fi

# Check if vite is available
if npx vite --version 2>/dev/null; then
    echo "🚀 Starting development server..."
    echo "📱 Open your browser to: http://localhost:5173"
    echo "🍪 Cookie-Licking Detector is ready!"
    npx vite
else
    echo "❌ Vite not found. Please install dependencies first."
    exit 1
fi
