#!/bin/bash
# 3-rotate-keys.sh - Rotate Linear CLI keys

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

# Safe env file parser - prevents code injection from malformed .env files
# Only exports KEY=VALUE pairs, ignores comments and empty lines
load_env_safely() {
    local env_file="$1"
    if [ ! -f "$env_file" ]; then
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

echo "🔄 Rotate Linear CLI Keys"
echo "========================="
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found!"
    echo "Run: ./1-update-env.sh first"
    exit 1
fi

# Load current credentials safely (no code execution)
load_env_safely "$ENV_FILE"

echo "Current Linear CLI configuration:"
linear config show

echo ""
echo "⚠️  WARNING: This will:"
echo "  1. Clear current Linear CLI config"
echo "  2. Set new API key from .env"
echo "  3. Update all Linear CLI credentials"
echo ""
read -p "Continue? [y/N] " CONFIRM

if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 0
fi

echo ""
echo "🔄 Rotating keys..."

# Clear existing Linear CLI config
if [ -f "$HOME/.config/linear/config.json" ]; then
    cp "$HOME/.config/linear/config.json" "$HOME/.config/linear/config.json.backup"
    echo "💾 Backed up existing Linear CLI config"
fi

# Set new API key
linear config set apiKey "$LINEAR_API_KEY"
echo "✅ Updated Linear CLI API key"

# Test new configuration
echo ""
echo "🧪 Testing new configuration..."
TEST_RESPONSE=$(linear viewer --json 2>&1)

if echo "$TEST_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    VIEWER_NAME=$(echo "$TEST_RESPONSE" | jq -r '.name')
    VIEWER_EMAIL=$(echo "$TEST_RESPONSE" | jq -r '.email')
    echo "✅ Linear CLI working - Logged in as: $VIEWER_NAME ($VIEWER_EMAIL)"
else
    echo "❌ Linear CLI test failed"
    echo "$TEST_RESPONSE"

    # Restore backup
    if [ -f "$HOME/.config/linear/config.json.backup" ]; then
        mv "$HOME/.config/linear/config.json.backup" "$HOME/.config/linear/config.json"
        echo "🔙 Restored previous configuration"
    fi
    exit 1
fi

# List teams to verify
echo ""
echo "📋 Available teams:"
linear team list

echo ""
echo "🎉 Key rotation complete!"
echo ""
echo "📊 Summary:"
echo "   ✅ API key rotated in Linear CLI"
echo "   ✅ Configuration tested and working"
echo "   💾 Backup saved: ~/.config/linear/config.json.backup"
echo ""
echo "💡 You can now use Linear CLI with new keys:"
echo "   linear issue list"
echo "   linear team list"
echo "   linear project list"
