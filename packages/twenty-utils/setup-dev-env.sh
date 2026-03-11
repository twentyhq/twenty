#!/bin/bash
# =============================================================================
# Twenty CRM — Development Environment Setup
# =============================================================================
# Single entry point for setting up a dev environment. Idempotent.
#
# What it does:
#   1. Starts Postgres + Redis (local services or Docker, auto-detected)
#   2. Creates 'default' and 'test' databases
#   3. Copies .env.example -> .env for front and server
#
# Usage (from repo root):
#   bash packages/twenty-utils/setup-dev-env.sh          # start + configure
#   bash packages/twenty-utils/setup-dev-env.sh --down    # stop services
#   bash packages/twenty-utils/setup-dev-env.sh --reset   # wipe data + restart
#   bash packages/twenty-utils/setup-dev-env.sh --docker  # force Docker mode
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/packages/twenty-docker/docker-compose.dev.yml"

info()  { echo "=> $*"; }
ok()    { echo "   done: $*"; }
fail()  { echo "   FAIL: $*" >&2; }

# --------------- detection helpers ---------------
has_local_pg() {
  command -v pg_ctlcluster &>/dev/null && pg_lsclusters 2>/dev/null | grep -q "16"
}

has_local_redis() {
  command -v redis-server &>/dev/null
}

can_use_docker() {
  docker compose version &>/dev/null 2>&1
}

pg_is_up() {
  pg_isready -h localhost -p 5432 -U postgres -q 2>/dev/null
}

redis_is_up() {
  redis-cli -h localhost -p 6379 ping 2>/dev/null | grep -q PONG
}

wait_for_pg() {
  local retries=30
  while ! pg_is_up; do
    retries=$((retries - 1))
    if [ "$retries" -le 0 ]; then fail "PostgreSQL did not start in time"; exit 1; fi
    sleep 1
  done
}

wait_for_redis() {
  local retries=30
  while ! redis_is_up; do
    retries=$((retries - 1))
    if [ "$retries" -le 0 ]; then fail "Redis did not start in time"; exit 1; fi
    sleep 1
  done
}

# --------------- parse flags ---------------
USE_DOCKER=false
ACTION="up"

while [ $# -gt 0 ]; do
  case "$1" in
    --docker) USE_DOCKER=true ;;
    --down)   ACTION="down" ;;
    --reset)  ACTION="reset" ;;
    *) echo "Unknown flag: $1"; exit 1 ;;
  esac
  shift
done

# --------------- stop ---------------
stop_services() {
  if can_use_docker && docker compose -f "$COMPOSE_FILE" ps --quiet 2>/dev/null | grep -q .; then
    docker compose -f "$COMPOSE_FILE" down "$@"
    return
  fi
  if has_local_pg; then sudo pg_ctlcluster 16 main stop 2>/dev/null || true; fi
  if has_local_redis && pgrep -x redis-server &>/dev/null; then
    sudo service redis-server stop 2>/dev/null || true
  fi
}

if [ "$ACTION" = "down" ]; then
  info "Stopping dev services..."
  stop_services
  ok "Services stopped"
  exit 0
fi

if [ "$ACTION" = "reset" ]; then
  info "Resetting dev services (wiping data)..."
  stop_services -v 2>/dev/null || stop_services
fi

# =============================================================================
# 1. Start services (auto-detect: local > Docker)
# =============================================================================
start_pg() {
  if pg_is_up; then
    ok "PostgreSQL already running"
    return
  fi

  if [ "$USE_DOCKER" = false ] && has_local_pg; then
    info "Starting local PostgreSQL..."
    sudo pg_ctlcluster 16 main start
    wait_for_pg
    sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" 2>/dev/null || true
  elif can_use_docker; then
    info "Starting PostgreSQL via Docker..."
    docker compose -f "$COMPOSE_FILE" up -d db
    wait_for_pg
  else
    fail "No PostgreSQL available. Install PostgreSQL 16 or Docker."
    exit 1
  fi
}

start_redis() {
  if redis_is_up; then
    ok "Redis already running"
    return
  fi

  if [ "$USE_DOCKER" = false ] && has_local_redis; then
    info "Starting local Redis..."
    sudo service redis-server start 2>/dev/null || redis-server --daemonize yes 2>/dev/null
    wait_for_redis
  elif can_use_docker; then
    info "Starting Redis via Docker..."
    docker compose -f "$COMPOSE_FILE" up -d redis
    wait_for_redis
  else
    fail "No Redis available. Install Redis or Docker."
    exit 1
  fi
}

if [ "$USE_DOCKER" = true ]; then
  info "Starting services via Docker Compose..."
  docker compose -f "$COMPOSE_FILE" up -d
  wait_for_pg
  wait_for_redis
else
  start_pg
  start_redis
fi

ok "PostgreSQL on localhost:5432"
ok "Redis on localhost:6379"

# =============================================================================
# 2. Create databases
# =============================================================================
info "Creating databases..."
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d postgres \
  -c 'CREATE DATABASE "default";' 2>/dev/null || true
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d postgres \
  -c 'CREATE DATABASE "test";' 2>/dev/null || true
ok "Databases 'default' and 'test' ready"

# =============================================================================
# 3. Environment files (via Nx when available, fallback to cp)
# =============================================================================
info "Setting up .env files..."
cd "$REPO_ROOT"

if command -v npx &>/dev/null && [ -d node_modules ]; then
  npx nx reset:env twenty-front
  npx nx reset:env twenty-server
else
  for pkg in twenty-front twenty-server; do
    src="packages/$pkg/.env.example"
    dst="packages/$pkg/.env"
    if [ -f "$src" ] && [ ! -f "$dst" ]; then
      cp "$src" "$dst"
      ok "$pkg/.env created"
    fi
  done
fi

# =============================================================================
echo ""
echo "Dev environment ready."
echo ""
echo "  yarn start                         # start everything"
echo "  npx nx start twenty-front          # frontend  -> http://localhost:3001"
echo "  npx nx start twenty-server         # backend   -> http://localhost:3000"
echo ""
