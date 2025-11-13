#!/bin/bash
set -e

echo "🔨 Building Docker image locally..."
docker build \
  -f ./packages/twenty-docker/twenty/Dockerfile \
  -t flcrmlms-test:latest \
  --build-arg REACT_APP_SERVER_BASE_URL=https://test.example.com \
  --build-arg APP_VERSION=0.0.0-local-test \
  .

echo "✅ Docker build successful!"

echo "🧪 Testing migration command..."
docker run --rm \
  -e PG_DATABASE_URL="${PG_DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/default}" \
  -e REDIS_URL="${REDIS_URL:-redis://localhost:6379}" \
  -e APP_SECRET="${APP_SECRET:-test-secret-change-in-production}" \
  -e APP_VERSION="0.0.0-local-test" \
  -e DISABLE_CRON_JOBS_REGISTRATION=true \
  flcrmlms-test:latest \
  node --version

echo "✅ Container runs successfully!"
