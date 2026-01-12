#!/bin/bash

# Test SMTP email configuration

echo "Testing email configuration..."

# Load environment variables (export them)
set -a
source .env
set +a

if [ -z "$EMAIL_SMTP_HOST" ]; then
    echo "❌ Email not configured. Check .env file."
    exit 1
fi

echo "SMTP Host: $EMAIL_SMTP_HOST"
echo "SMTP Port: $EMAIL_SMTP_PORT"
echo "From: $EMAIL_FROM_NAME <$EMAIL_FROM_ADDRESS>"

# Test SMTP connection using telnet/nc
if command -v nc &> /dev/null; then
    echo ""
    echo "Testing connection to SMTP server..."
    timeout 5 nc -zv "$EMAIL_SMTP_HOST" "$EMAIL_SMTP_PORT" 2>&1

    if [ $? -eq 0 ]; then
        echo "✓ Successfully connected to SMTP server"
    else
        echo "❌ Cannot connect to SMTP server"
        exit 1
    fi
else
    echo "⚠ nc (netcat) not installed, skipping connection test"
fi

echo ""
echo "To test actual email sending:"
echo "1. Configure EMAIL_SMTP_USER and EMAIL_SMTP_PASSWORD in .env"
echo "2. Restart Twenty: docker compose restart server worker"
echo "3. Trigger email in Twenty CRM (e.g., password reset)"
