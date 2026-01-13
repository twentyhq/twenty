#!/bin/bash

# Test SMTP email configuration

echo "Testing email configuration..."

# Safe env file parser - prevents code injection from malformed .env files
# Only exports KEY=VALUE pairs, ignores comments and empty lines
load_env_safely() {
    local env_file="$1"
    if [ ! -f "$env_file" ]; then
        echo "❌ .env file not found at: $env_file"
        return 1
    fi

    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

        # Only process valid KEY=VALUE patterns (alphanumeric keys, no spaces before =)
        if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
            # Extract key and value safely
            local key="${line%%=*}"
            local value="${line#*=}"
            # Remove surrounding quotes if present
            value="${value#\"}"
            value="${value%\"}"
            value="${value#\'}"
            value="${value%\'}"
            # Export the variable
            export "$key=$value"
        fi
    done < "$env_file"
}

# Load environment variables safely (no code execution)
load_env_safely ".env" || exit 1

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
