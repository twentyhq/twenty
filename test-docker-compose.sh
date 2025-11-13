#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$SCRIPT_DIR/packages/twenty-docker"

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_step() {
    echo -e "\n${GREEN}▶${NC} ${BLUE}$1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    local all_ok=true

    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
        print_success "Docker installed: $DOCKER_VERSION"
    else
        print_error "Docker is not installed"
        echo "  Install from: https://docs.docker.com/get-docker/"
        all_ok=false
    fi

    # Check Docker Compose
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        if docker compose version &> /dev/null; then
            COMPOSE_VERSION=$(docker compose version --short)
            print_success "Docker Compose installed: $COMPOSE_VERSION"
        else
            COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | tr -d ',')
            print_success "Docker Compose installed: $COMPOSE_VERSION"
        fi
    else
        print_error "Docker Compose is not installed"
        all_ok=false
    fi

    # Check Docker daemon
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
        echo "  Start Docker Desktop or run: sudo systemctl start docker"
        all_ok=false
    fi

    # Check if docker-compose.yml exists
    if [[ -f "$DOCKER_DIR/docker-compose.yml" ]]; then
        print_success "docker-compose.yml found"
    else
        print_error "docker-compose.yml not found at $DOCKER_DIR"
        all_ok=false
    fi

    if [[ "$all_ok" == "false" ]]; then
        echo ""
        print_error "Prerequisites check failed. Please fix the issues above."
        exit 1
    fi

    echo ""
}

# Check GHCR authentication
check_ghcr_auth() {
    print_header "Checking GHCR Authentication"

    print_info "Testing authentication to ghcr.io/connorbelez/flcrmlms..."

    if docker pull ghcr.io/connorbelez/flcrmlms:latest &>/dev/null; then
        print_success "GHCR authentication is valid!"
        return 0
    else
        print_warning "Not authenticated to GHCR or authentication is invalid"
        echo ""
        echo "You need to authenticate to pull the private image."
        echo ""
        echo "Options:"
        echo "  1. Run the authentication helper script:"
        echo "     ${GREEN}bash packages/twenty-docker/setup-ghcr-auth.sh${NC}"
        echo ""
        echo "  2. Manual authentication:"
        echo "     ${GREEN}echo \"\$GITHUB_TOKEN\" | docker login ghcr.io -u \$GITHUB_USERNAME --password-stdin${NC}"
        echo ""
        echo "You need a GitHub Personal Access Token with 'read:packages' scope."
        echo "Create one at: ${BLUE}https://github.com/settings/tokens/new${NC}"
        echo ""

        read -p "Do you want to run the authentication helper now? (Y/n): " -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            bash "$DOCKER_DIR/setup-ghcr-auth.sh"
            return $?
        else
            print_error "Cannot proceed without authentication"
            exit 1
        fi
    fi
}

# Setup .env file
setup_env_file() {
    print_header "Setting Up Environment Variables"

    if [[ -f "$DOCKER_DIR/.env" ]]; then
        print_success "Found existing .env file"

        # Show current configuration
        echo ""
        print_info "Current configuration:"
        grep -E "^(TAG|SERVER_URL|APP_VERSION|PG_DATABASE_PASSWORD|APP_SECRET)=" "$DOCKER_DIR/.env" | while read -r line; do
            echo "  $line"
        done
        echo ""

        read -p "Do you want to use the existing .env file? (Y/n): " -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            create_env_file
        fi
    else
        print_warning "No .env file found"
        create_env_file
    fi
}

create_env_file() {
    print_info "Creating .env file..."

    # Default values
    TAG="${TAG:-latest}"
    SERVER_URL="${SERVER_URL:-http://localhost:3000}"
    APP_VERSION="${APP_VERSION:-0.0.0-local}"
    PG_DATABASE_PASSWORD="${PG_DATABASE_PASSWORD:-$(openssl rand -base64 32 2>/dev/null || echo "change_me_$(date +%s)")}"
    APP_SECRET="${APP_SECRET:-$(openssl rand -base64 32 2>/dev/null || echo "change_me_please_with_at_least_32_characters")}"

    cat > "$DOCKER_DIR/.env" <<EOF
# Docker Image Configuration
TAG=$TAG

# Application Configuration
SERVER_URL=$SERVER_URL
APP_VERSION=$APP_VERSION
APP_SECRET=$APP_SECRET

# Database Configuration
PG_DATABASE_NAME=default
PG_DATABASE_USER=postgres
PG_DATABASE_PASSWORD=$PG_DATABASE_PASSWORD
PG_DATABASE_HOST=db
PG_DATABASE_PORT=5432

# Redis Configuration
REDIS_URL=redis://redis:6379

# Optional: Disable migrations/cron if needed
# DISABLE_DB_MIGRATIONS=false
# DISABLE_CRON_JOBS_REGISTRATION=false

# Storage Configuration (uncomment for S3)
# STORAGE_TYPE=s3
# STORAGE_S3_REGION=us-east-1
# STORAGE_S3_NAME=your-bucket-name
# STORAGE_S3_ENDPOINT=https://s3.amazonaws.com
EOF

    print_success "Created .env file with default values"
    print_warning "Review and update the values in $DOCKER_DIR/.env as needed"
    echo ""
}

# Pull images
pull_images() {
    print_header "Pulling Docker Images"

    cd "$DOCKER_DIR"

    print_step "Pulling images (this may take a few minutes)..."
    if docker compose pull; then
        print_success "Successfully pulled all images"
    else
        print_error "Failed to pull images"
        echo ""
        print_info "Common issues:"
        echo "  - GHCR authentication expired"
        echo "  - Network connectivity issues"
        echo "  - Image tag doesn't exist"
        echo ""
        return 1
    fi
}

# Start services
start_services() {
    print_header "Starting Services"

    cd "$DOCKER_DIR"

    print_step "Starting docker-compose services..."
    if docker compose up -d; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        return 1
    fi

    echo ""
    print_info "Services started:"
    docker compose ps
}

# Wait for services to be healthy
wait_for_health() {
    print_header "Waiting for Services to Become Healthy"

    cd "$DOCKER_DIR"

    local max_wait=180  # 3 minutes
    local waited=0
    local check_interval=5

    print_info "This may take a few minutes for migrations to complete..."
    echo ""

    while [ $waited -lt $max_wait ]; do
        # Check database health
        local db_status=$(docker compose ps db --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

        # Check Redis health
        local redis_status=$(docker compose ps redis --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

        # Check server health
        local server_status=$(docker compose ps server --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

        # Check worker status (no health check)
        local worker_status=$(docker compose ps worker --format json 2>/dev/null | grep -o '"State":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

        echo -ne "\r  DB: ${db_status}  |  Redis: ${redis_status}  |  Server: ${server_status}  |  Worker: ${worker_status}  |  Waited: ${waited}s  "

        if [[ "$db_status" == "healthy" ]] && [[ "$redis_status" == "healthy" ]] && [[ "$server_status" == "healthy" ]] && [[ "$worker_status" == "running" ]]; then
            echo ""
            echo ""
            print_success "All services are healthy!"
            return 0
        fi

        sleep $check_interval
        waited=$((waited + check_interval))
    done

    echo ""
    echo ""
    print_error "Services did not become healthy within ${max_wait} seconds"
    echo ""
    print_info "Checking logs for issues..."
    return 1
}

# Check logs for errors
check_logs() {
    print_header "Checking Service Logs"

    cd "$DOCKER_DIR"

    print_step "Server logs (last 30 lines):"
    docker compose logs --tail=30 server

    echo ""
    print_step "Worker logs (last 30 lines):"
    docker compose logs --tail=30 worker

    echo ""
    print_step "Database logs (last 20 lines):"
    docker compose logs --tail=20 db
}

# Test application connectivity
test_connectivity() {
    print_header "Testing Application Connectivity"

    local server_url="${SERVER_URL:-http://localhost:3000}"

    print_step "Testing health endpoint..."
    if curl -f -s "${server_url}/healthz" > /dev/null; then
        print_success "Health check endpoint is responding"
    else
        print_warning "Health check endpoint is not responding yet"
        echo "  Try accessing it manually: ${server_url}/healthz"
    fi

    echo ""
    print_step "Testing main application..."
    if curl -f -s -o /dev/null "${server_url}"; then
        print_success "Application is accessible"
    else
        print_warning "Application may not be ready yet"
    fi
}

# Show next steps
show_next_steps() {
    print_header "Test Complete!"

    local server_url="${SERVER_URL:-http://localhost:3000}"

    echo "Your FLCRMLMS instance is running! 🎉"
    echo ""
    echo "${GREEN}Access the application:${NC}"
    echo "  ${BLUE}${server_url}${NC}"
    echo ""
    echo "${GREEN}Useful commands:${NC}"
    echo "  View logs:        ${CYAN}cd packages/twenty-docker && docker compose logs -f server${NC}"
    echo "  Stop services:    ${CYAN}cd packages/twenty-docker && docker compose down${NC}"
    echo "  Restart services: ${CYAN}cd packages/twenty-docker && docker compose restart${NC}"
    echo "  Check status:     ${CYAN}cd packages/twenty-docker && docker compose ps${NC}"
    echo ""
    echo "${GREEN}Database access:${NC}"
    echo "  ${CYAN}cd packages/twenty-docker && docker compose exec db psql -U postgres -d default${NC}"
    echo ""
    echo "${GREEN}Redis access:${NC}"
    echo "  ${CYAN}cd packages/twenty-docker && docker compose exec redis redis-cli${NC}"
    echo ""
    echo "For more information, see:"
    echo "  - ${BLUE}packages/twenty-docker/README-CUSTOM.md${NC}"
    echo "  - ${BLUE}DOCKER-QUICKSTART.md${NC}"
    echo ""
}

# Cleanup on failure
cleanup_on_failure() {
    print_header "Cleaning Up After Failure"

    cd "$DOCKER_DIR"

    print_info "Stopping services..."
    docker compose down

    echo ""
    print_info "Logs have been preserved above for debugging"
}

# Main test flow
main() {
    print_header "FLCRMLMS Docker Compose Test Suite"

    echo "This script will:"
    echo "  1. Check prerequisites"
    echo "  2. Verify GHCR authentication"
    echo "  3. Set up environment variables"
    echo "  4. Pull Docker images"
    echo "  5. Start services"
    echo "  6. Wait for services to become healthy"
    echo "  7. Test connectivity"
    echo ""

    read -p "Continue? (Y/n): " -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo "Aborted."
        exit 0
    fi

    # Run test steps
    check_prerequisites
    check_ghcr_auth
    setup_env_file
    pull_images || { print_error "Failed to pull images"; exit 1; }
    start_services || { print_error "Failed to start services"; check_logs; exit 1; }

    if wait_for_health; then
        test_connectivity
        show_next_steps
    else
        check_logs
        echo ""
        print_error "Services failed to become healthy"
        echo ""
        read -p "Do you want to clean up (stop services)? (Y/n): " -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            cleanup_on_failure
        fi
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Test the Docker Compose setup for FLCRMLMS"
        echo ""
        echo "Options:"
        echo "  (no args)    Run full test suite"
        echo "  --logs       Show current service logs"
        echo "  --status     Show service status"
        echo "  --stop       Stop all services"
        echo "  --restart    Restart all services"
        echo "  --clean      Stop services and remove volumes"
        echo "  --help       Show this help message"
        exit 0
        ;;
    --logs)
        cd "$DOCKER_DIR"
        docker compose logs -f
        exit 0
        ;;
    --status)
        cd "$DOCKER_DIR"
        docker compose ps
        exit 0
        ;;
    --stop)
        cd "$DOCKER_DIR"
        print_info "Stopping services..."
        docker compose down
        print_success "Services stopped"
        exit 0
        ;;
    --restart)
        cd "$DOCKER_DIR"
        print_info "Restarting services..."
        docker compose restart
        print_success "Services restarted"
        exit 0
        ;;
    --clean)
        cd "$DOCKER_DIR"
        print_warning "This will remove all volumes and delete data!"
        read -p "Are you sure? (y/N): " -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose down -v
            print_success "Services stopped and volumes removed"
        else
            echo "Aborted."
        fi
        exit 0
        ;;
esac

# Run main test
main "$@"
