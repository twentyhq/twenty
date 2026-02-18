#!/bin/bash
set -e

echo "Setting up dev environment..."

npx nx reset:env twenty-front
npx nx reset:env twenty-server

PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d postgres -c 'CREATE DATABASE "default";' 2>/dev/null || true
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d postgres -c 'CREATE DATABASE "test";' 2>/dev/null || true

echo "Dev environment ready."
