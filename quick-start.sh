#!/bin/bash

# Twenty Real Estate - Quick Start Script
# This script sets up the development environment for Twenty Real Estate

set -e  # Exit on error

echo "🏗️  Twenty Real Estate - Quick Start"
echo "======================================"
echo ""

# Change to project directory (script location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Project directory: $PWD"
echo ""

# Step 1: Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js version (require 18+)
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js: $NODE_VERSION"

# Verify Node.js minimum version (18+)
NODE_MAJOR=$(node --version | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Your version: $NODE_VERSION"
    echo "   Please upgrade from https://nodejs.org or use nvm: nvm install 18"
    exit 1
fi

# Check Yarn
if ! command -v yarn &> /dev/null; then
    echo "⚠️  Yarn not found. Enabling Corepack..."
    corepack enable
fi
YARN_VERSION=$(yarn --version)
echo "✅ Yarn: $YARN_VERSION"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop"
    exit 1
fi
DOCKER_VERSION=$(docker --version)
echo "✅ Docker: $DOCKER_VERSION"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop"
    exit 1
fi
echo "✅ Docker is running"

echo ""
echo "📦 Step 2: Installing dependencies (this may take 5-10 minutes)..."
echo ""

# Install dependencies
yarn install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Step 3: Start database services
echo "🐘 Step 3: Starting PostgreSQL and Redis..."
echo ""

docker-compose -f packages/twenty-docker/docker-compose.dev.yml up -d db redis

# Wait for services to be ready with proper health checks
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker-compose -f packages/twenty-docker/docker-compose.dev.yml exec -T db pg_isready -U postgres &> /dev/null; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  PostgreSQL took longer than expected to start"
    fi
    sleep 2
done

echo "⏳ Waiting for Redis to be ready..."
for i in {1..30}; do
    if docker-compose -f packages/twenty-docker/docker-compose.dev.yml exec -T redis redis-cli ping &> /dev/null; then
        echo "✅ Redis is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  Redis took longer than expected to start"
    fi
    sleep 2
done

# Check if services are running
docker-compose -f packages/twenty-docker/docker-compose.dev.yml ps

echo ""
echo "✅ Database services started!"
echo ""

# Step 4: Initialize database (only if needed)
echo "💾 Step 4: Checking database status..."
echo ""
echo "⚠️  If this is your first time running Twenty, you need to initialize the database."
echo "   Run: npx nx run twenty-server:database:init:prod"
echo ""
read -p "Initialize database now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx nx run twenty-server:database:init:prod
    echo "✅ Database initialized!"
fi

echo ""
echo "🚀 Step 5: Starting development servers..."
echo ""
echo "This will start:"
echo "  - Backend API (port 3000)"
echo "  - Frontend (port 3001)"
echo "  - Worker (background jobs)"
echo ""
echo "⏳ Starting servers..."
echo ""

# Start all services
echo "🚀 Starting development servers..."
echo ""
echo "Access points:"
echo "  🌐 Frontend: http://localhost:3001"
echo "  🔌 Backend API: http://localhost:3000"
echo "  📊 GraphQL Playground: http://localhost:3000/graphql"
echo ""
echo "Press Ctrl+C to stop all servers"
yarn start