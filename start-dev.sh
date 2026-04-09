#!/bin/bash
# Quick start script for Twenty
# For development: runs services locally without Docker

echo "Starting PostgreSQL..."
docker run -d --name twenty-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=default \
  postgres:16-alpine

echo "Starting Redis..."
docker run -d --name twenty-redis -p 6379:6379 \
  redis:7-alpine redis-server --appendonly yes

echo "Waiting for services..."
sleep 5

echo "Installing dependencies..."
yarn install

echo "Running migrations..."
yarn nx run twenty-server:migration:run

echo "Starting backend (3000) and frontend (3001)..."
yarn start

# To stop: docker stop twenty-db twenty-redis
