#!/bin/bash

# Twenty CRM Infrastructure Health Check

echo "======================================"
echo "Twenty CRM Health Check"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker containers
echo "1. Docker Containers Status"
echo "----------------------------"
CONTAINERS=$(docker compose ps --format json | jq -r '.Name')
for container in $CONTAINERS; do
    STATUS=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null)
    HEALTH=$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null)

    if [ "$STATUS" == "running" ]; then
        if [ "$HEALTH" == "healthy" ] || [ "$HEALTH" == "" ]; then
            echo -e "${GREEN}✓${NC} $container: running"
        else
            echo -e "${YELLOW}⚠${NC} $container: running but $HEALTH"
        fi
    else
        echo -e "${RED}✗${NC} $container: $STATUS"
    fi
done
echo ""

# Check HTTPS access
echo "2. HTTPS Access"
echo "---------------"
if curl -k -s -o /dev/null -w "%{http_code}" https://localhost:3443 | grep -q "200"; then
    echo -e "${GREEN}✓${NC} HTTPS: accessible at https://localhost:3443"
else
    echo -e "${RED}✗${NC} HTTPS: not accessible"
fi
echo ""

# Check HTTP redirect
echo "3. HTTP to HTTPS Redirect"
echo "-------------------------"
REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3080)
if [ "$REDIRECT" == "301" ]; then
    echo -e "${GREEN}✓${NC} HTTP redirects to HTTPS"
else
    echo -e "${YELLOW}⚠${NC} HTTP redirect: $REDIRECT (expected 301)"
fi
echo ""

# Check backup system
echo "4. Backup System"
echo "----------------"
if [ -f "scripts/backup-database.sh" ]; then
    echo -e "${GREEN}✓${NC} Backup script exists"

    if [ -d "$HOME/Desktop/twenty-backups" ]; then
        BACKUP_COUNT=$(ls -1 "$HOME/Desktop/twenty-backups"/*.sql.gz 2>/dev/null | wc -l)
        echo -e "${GREEN}✓${NC} Backup directory exists ($BACKUP_COUNT backups)"
    else
        echo -e "${YELLOW}⚠${NC} Backup directory not created yet"
    fi

    # Check scheduled task (Windows)
    if command -v powershell &> /dev/null; then
        if powershell -Command "Get-ScheduledTask -TaskName 'TwentyCRM-DailyBackup' -ErrorAction SilentlyContinue" &> /dev/null; then
            echo -e "${GREEN}✓${NC} Scheduled backup task configured"
        else
            echo -e "${YELLOW}⚠${NC} Scheduled backup task not found"
        fi
    fi
else
    echo -e "${RED}✗${NC} Backup script missing"
fi
echo ""

# Check SSL certificates
echo "5. SSL Certificates"
echo "-------------------"
if [ -f "nginx/ssl/twenty.crt" ] && [ -f "nginx/ssl/twenty.key" ]; then
    echo -e "${GREEN}✓${NC} SSL certificates exist"

    # Check expiration
    EXPIRY=$(openssl x509 -enddate -noout -in nginx/ssl/twenty.crt | cut -d= -f2)
    echo "   Expires: $EXPIRY"
else
    echo -e "${RED}✗${NC} SSL certificates missing"
fi
echo ""

# Check storage configuration
echo "6. Storage Configuration"
echo "------------------------"
STORAGE_TYPE=$(grep "^STORAGE_TYPE=" .env | cut -d= -f2)
if [ "$STORAGE_TYPE" == "s3" ]; then
    echo -e "${GREEN}✓${NC} Storage: S3"
    S3_BUCKET=$(grep "^STORAGE_S3_NAME=" .env | cut -d= -f2)
    echo "   Bucket: $S3_BUCKET"
elif [ "$STORAGE_TYPE" == "local" ]; then
    echo -e "${YELLOW}⚠${NC} Storage: Local filesystem"
else
    echo -e "${RED}✗${NC} Storage: Not configured"
fi
echo ""

# Check email configuration
echo "7. Email Configuration"
echo "----------------------"
EMAIL_HOST=$(grep "^EMAIL_SMTP_HOST=" .env | cut -d= -f2)
if [ -n "$EMAIL_HOST" ]; then
    echo -e "${GREEN}✓${NC} Email configured: $EMAIL_HOST"
else
    echo -e "${YELLOW}⚠${NC} Email not configured"
fi
echo ""

# Check environment variables
echo "8. Environment Variables"
echo "------------------------"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"

    # Check critical variables
    CRITICAL_VARS=("APP_SECRET" "PG_DATABASE_PASSWORD" "SERVER_URL")
    for var in "${CRITICAL_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            echo -e "${GREEN}✓${NC} $var is set"
        else
            echo -e "${RED}✗${NC} $var is missing"
        fi
    done
else
    echo -e "${RED}✗${NC} .env file missing"
fi
echo ""

# Summary
echo "======================================"
echo "Health Check Complete"
echo "======================================"
