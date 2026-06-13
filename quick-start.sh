#!/bin/bash

# Twenty Real Estate - Quick Start Script
# This script sets up the development environment for Twenty Real Estate

set -e  # Exit on error

echo "🏗️  Twenty Real Estate - Quick Start"
echo "======================================"
echo ""

# Change to project directory
PROJECT_DIR="/Users/bashir/workspace/02-Design/twenty-real-estate"
cd "$PROJECT_DIR"

echo "📁 Project directory: $PWD"
echo ""

# Step 1: Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js: $NODE_VERSION"

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

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

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
yarn start

# This point won't be reached unless user stops the servers
echo ""
echo "✅ Servers started!"
echo ""
echo "Access points:"
echo "  🌐 Frontend: http://localhost:3001"
echo "  🔌 Backend API: http://localhost:3000"
echo "  📊 GraphQL Playground: http://localhost:3000/graphql"
echo ""
echo "Press Ctrl+C to stop all servers"