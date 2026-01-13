#!/bin/bash
# export-env.sh - Load and export ALL .env variables to shell
#
# Usage: source scripts/export-env.sh
#        bash scripts/export-env.sh

set -e

# Find root (script is in crm-twenty/scripts)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

echo "📤 Export Environment Variables"
echo "================================"
echo ""
echo "   ROOT: $ROOT_DIR"
echo "   ENV:  $ENV_FILE"
echo ""

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found at $ENV_FILE"
    exit 1
fi

# Count variables
VAR_COUNT=$(grep -c '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" || echo "0")
echo "   Found $VAR_COUNT variables"
echo ""

# Detect shell
if [[ "$SHELL" == *"zsh"* ]]; then
    SHELL_PROFILE="$HOME/.zshrc"
    SHELL_NAME="zsh"
else
    SHELL_PROFILE="$HOME/.bashrc"
    SHELL_NAME="bash"
fi

echo "Detected shell: $SHELL_NAME"
echo "Profile file: $SHELL_PROFILE"
echo ""
echo "Choose export method:"
echo "  1) Current session only (temporary)"
echo "  2) Add to $SHELL_PROFILE (permanent)"
echo "  3) Both"
echo "  4) Print export commands (copy/paste)"
echo ""
read -p "Select [1-4]: " CHOICE

# Function to export all variables from .env
export_to_session() {
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

        # Export variable lines
        if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            export "$key=$value"
        fi
    done < "$ENV_FILE"
}

# Function to generate export block for shell profile
generate_export_block() {
    echo ""
    echo "# ═══════════════════════════════════════════════════════════════════"
    echo "# Environment Variables (added by export-env.sh)"
    echo "# Generated: $(date)"
    echo "# Source: $ENV_FILE"
    echo "# ═══════════════════════════════════════════════════════════════════"
    echo ""

    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines
        [[ -z "$line" ]] && continue

        # Keep comments
        if [[ "$line" =~ ^[[:space:]]*# ]]; then
            echo "$line"
            continue
        fi

        # Export variable lines
        if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            echo "export $key=\"$value\""
        fi
    done < "$ENV_FILE"

    echo ""
}

case $CHOICE in
    1)
        # Current session only
        export_to_session
        echo ""
        echo "✅ $VAR_COUNT variables exported to current session"
        echo "⚠️  Will be lost when terminal closes"
        ;;
    2)
        # Shell profile only
        ENV_BLOCK=$(generate_export_block)

        # Remove old block if exists
        if grep -q "# Environment Variables (added by export-env.sh)" "$SHELL_PROFILE" 2>/dev/null; then
            # Create backup
            cp "$SHELL_PROFILE" "$SHELL_PROFILE.bak"
            # Remove old block (from marker to next section or end)
            sed -i '/# ═.*Environment Variables/,/^# ═/{ /^# ═.*Environment Variables/d; /^# ═/!d; }' "$SHELL_PROFILE"
            echo "🗑️  Removed old env block from $SHELL_PROFILE"
        fi

        # Add new block
        echo "$ENV_BLOCK" >> "$SHELL_PROFILE"
        echo ""
        echo "✅ Added $VAR_COUNT variables to $SHELL_PROFILE"
        echo "🔄 Run: source $SHELL_PROFILE"
        ;;
    3)
        # Both
        export_to_session

        ENV_BLOCK=$(generate_export_block)

        if grep -q "# Environment Variables (added by export-env.sh)" "$SHELL_PROFILE" 2>/dev/null; then
            cp "$SHELL_PROFILE" "$SHELL_PROFILE.bak"
            sed -i '/# ═.*Environment Variables/,/^# ═/{ /^# ═.*Environment Variables/d; /^# ═/!d; }' "$SHELL_PROFILE"
        fi

        echo "$ENV_BLOCK" >> "$SHELL_PROFILE"
        echo ""
        echo "✅ Exported to current session AND $SHELL_PROFILE"
        ;;
    4)
        # Print for copy/paste
        echo ""
        echo "📋 Copy these commands:"
        echo "────────────────────────────────────────"
        generate_export_block
        echo "────────────────────────────────────────"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# Quick test - check if LINEAR_API_KEY works (if it exists)
echo ""
if [ -n "$LINEAR_API_KEY" ]; then
    echo "🧪 Testing Linear connection..."
    RESPONSE=$(curl -s -X POST https://api.linear.app/graphql \
        -H "Authorization: $LINEAR_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"query":"{ viewer { name } }"}' 2>/dev/null || echo "")

    if echo "$RESPONSE" | grep -q '"name"'; then
        VIEWER=$(echo "$RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        echo "✅ Linear: Connected as $VIEWER"
    else
        echo "⚠️  Linear: Could not verify connection"
    fi
fi

echo ""
echo "🎉 Done!"
