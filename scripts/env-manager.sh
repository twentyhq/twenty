#!/bin/bash
# env-manager.sh - Manage environment variables with refresh tracking
# 
# Usage: bash env-manager.sh [ROOT_DIR]
#
# Features:
# - Define ROOT once, works from anywhere
# - Tracks refresh dates per key
# - Generates both .env and .env.example
# - Supports key rotation with prompts

set -e

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION - Define your project root
# ═══════════════════════════════════════════════════════════════════════════

# Accept ROOT_DIR as argument or use default
if [ -n "$1" ]; then
    ROOT_DIR="$1"
else
    # Default: same directory as script (crm-twenty/scripts -> crm-twenty)
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
fi

# Resolve to absolute path
ROOT_DIR="$(cd "$ROOT_DIR" 2>/dev/null && pwd)" || {
    echo "❌ Cannot find ROOT_DIR: $1"
    echo "   Usage: bash env-manager.sh /path/to/ai_layer"
    exit 1
}

ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE="$ROOT_DIR/.env.example"
ENV_BACKUP="$ROOT_DIR/.env.backup.$(date +%Y%m%d-%H%M%S)"

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║  🔧 Environment Manager                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "   ROOT_DIR: $ROOT_DIR"
echo "   ENV_FILE: $ENV_FILE"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# LOAD EXISTING VALUES
# ═══════════════════════════════════════════════════════════════════════════

load_existing() {
    local key="$1"
    if [ -f "$ENV_FILE" ]; then
        grep "^${key}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- || echo ""
    fi
}

EXISTING_LINEAR_CLIENT_ID=$(load_existing "LINEAR_CLIENT_ID")
EXISTING_LINEAR_CLIENT_SECRET=$(load_existing "LINEAR_CLIENT_SECRET")
EXISTING_LINEAR_API_KEY=$(load_existing "LINEAR_API_KEY")
EXISTING_LINEAR_TEAM_ID=$(load_existing "LINEAR_TEAM_ID")
EXISTING_LINEAR_PROJECT_ID=$(load_existing "LINEAR_PROJECT_ID")

# ═══════════════════════════════════════════════════════════════════════════
# MENU
# ═══════════════════════════════════════════════════════════════════════════

echo "What would you like to do?"
echo ""
echo "  1) Rotate Linear credentials"
echo "  2) Generate .env.example from current .env"
echo "  3) Show current credentials (masked)"
echo "  4) Exit"
echo ""
read -p "Choice [1-4]: " CHOICE

case $CHOICE in
    1) ;; # Continue to Linear update
    2) 
        # Generate .env.example
        if [ ! -f "$ENV_FILE" ]; then
            echo "❌ No .env found"
            exit 1
        fi
        
        echo ""
        echo "📝 Generating .env.example..."
        
        # Backup existing
        [ -f "$ENV_EXAMPLE" ] && cp "$ENV_EXAMPLE" "$ENV_EXAMPLE.backup"
        
        cat > "$ENV_EXAMPLE" << 'EXAMPLE_HEADER'
# ═══════════════════════════════════════════════════════════════════════════
# AI Layer - Environment Configuration Template
# ═══════════════════════════════════════════════════════════════════════════
#
# Copy this file to .env and fill in your values:
#   cp .env.example .env
#
# For secrets, use strong random values:
#   openssl rand -base64 32
#   openssl rand -hex 32
#
# ═══════════════════════════════════════════════════════════════════════════

EXAMPLE_HEADER

        # Process each line
        while IFS= read -r line || [ -n "$line" ]; do
            # Empty lines
            if [ -z "$line" ]; then
                echo "" >> "$ENV_EXAMPLE"
                continue
            fi
            
            # Comments - keep as is
            if [[ "$line" =~ ^[[:space:]]*# ]]; then
                echo "$line" >> "$ENV_EXAMPLE"
                continue
            fi
            
            # Variable lines - add placeholder
            if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
                key="${BASH_REMATCH[1]}"
                value="${BASH_REMATCH[2]}"
                
                # Smart placeholders
                case "$key" in
                    *_SECRET|*_PASSWORD|*SECRET*|*PASSWORD*)
                        echo "${key}=<generate-with-openssl-rand-base64-32>" >> "$ENV_EXAMPLE"
                        ;;
                    *_API_KEY|*API_KEY*)
                        echo "${key}=<your-api-key>" >> "$ENV_EXAMPLE"
                        ;;
                    *_TOKEN|*TOKEN*)
                        echo "${key}=<your-token>" >> "$ENV_EXAMPLE"
                        ;;
                    *_URL|*URL*)
                        echo "${key}=<https://your-url-here>" >> "$ENV_EXAMPLE"
                        ;;
                    *_PORT|*PORT*)
                        echo "${key}=${value}" >> "$ENV_EXAMPLE"  # Keep ports
                        ;;
                    *_ID)
                        echo "${key}=<your-id-here>" >> "$ENV_EXAMPLE"
                        ;;
                    LINEAR_CLIENT_ID)
                        echo "${key}=<get-from-linear.app/settings/api/applications>" >> "$ENV_EXAMPLE"
                        ;;
                    LINEAR_CLIENT_SECRET)
                        echo "${key}=<get-from-linear.app/settings/api/applications>" >> "$ENV_EXAMPLE"
                        ;;
                    LINEAR_API_KEY)
                        echo "${key}=<lin_api_xxx-from-linear.app/settings/api>" >> "$ENV_EXAMPLE"
                        ;;
                    LINEAR_TEAM_ID)
                        echo "${key}=<uuid-or-team-key-from-linear>" >> "$ENV_EXAMPLE"
                        ;;
                    LINEAR_PROJECT_ID)
                        echo "${key}=<uuid-optional>" >> "$ENV_EXAMPLE"
                        ;;
                    NODE_ENV)
                        echo "${key}=development" >> "$ENV_EXAMPLE"
                        ;;
                    *)
                        # Check if value looks like a secret
                        if [[ "$value" =~ ^(sk-|eyJ|lin_|dop_) ]]; then
                            echo "${key}=<your-${key,,}-here>" >> "$ENV_EXAMPLE"
                        elif [[ "$value" =~ ^[0-9]+$ ]]; then
                            echo "${key}=${value}" >> "$ENV_EXAMPLE"  # Keep numbers
                        elif [[ "$value" =~ ^(true|false)$ ]]; then
                            echo "${key}=${value}" >> "$ENV_EXAMPLE"  # Keep booleans
                        else
                            echo "${key}=<your-value-here>" >> "$ENV_EXAMPLE"
                        fi
                        ;;
                esac
                continue
            fi
            
            # Anything else
            echo "$line" >> "$ENV_EXAMPLE"
        done < "$ENV_FILE"
        
        echo "✅ Generated $ENV_EXAMPLE"
        exit 0
        ;;
    3)
        echo ""
        echo "📋 Current Linear credentials:"
        echo "   LINEAR_CLIENT_ID:     ${EXISTING_LINEAR_CLIENT_ID:0:8}..."
        echo "   LINEAR_CLIENT_SECRET: ${EXISTING_LINEAR_CLIENT_SECRET:0:8}..."
        echo "   LINEAR_API_KEY:       ${EXISTING_LINEAR_API_KEY:0:12}..."
        echo "   LINEAR_TEAM_ID:       $EXISTING_LINEAR_TEAM_ID"
        echo "   LINEAR_PROJECT_ID:    $EXISTING_LINEAR_PROJECT_ID"
        exit 0
        ;;
    4|*)
        echo "👋 Bye!"
        exit 0
        ;;
esac

# ═══════════════════════════════════════════════════════════════════════════
# LINEAR CREDENTIALS UPDATE
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║  📋 Linear Credentials                                            ║"
echo "║  Get from: https://linear.app/settings/api                        ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# CLIENT_ID
if [ -n "$EXISTING_LINEAR_CLIENT_ID" ]; then
    echo "   Current CLIENT_ID: ${EXISTING_LINEAR_CLIENT_ID:0:8}..."
    read -p "   Keep existing? [Y/n]: " KEEP_CLIENT_ID
    if [[ "$KEEP_CLIENT_ID" =~ ^[Nn]$ ]]; then
        read -p "   New LINEAR_CLIENT_ID: " LINEAR_CLIENT_ID
    else
        LINEAR_CLIENT_ID="$EXISTING_LINEAR_CLIENT_ID"
        echo "   ✅ Keeping existing"
    fi
else
    read -p "   LINEAR_CLIENT_ID: " LINEAR_CLIENT_ID
fi

# CLIENT_SECRET (rotation)
echo ""
if [ -n "$EXISTING_LINEAR_CLIENT_SECRET" ]; then
    echo "   🔐 CLIENT_SECRET exists"
    read -p "   Rotate secret? [y/N]: " ROTATE_SECRET
    if [[ "$ROTATE_SECRET" =~ ^[Yy]$ ]]; then
        read -p "   New LINEAR_CLIENT_SECRET: " LINEAR_CLIENT_SECRET
        LINEAR_CLIENT_SECRET_REFRESHED=$(date +%Y-%m-%d)
    else
        LINEAR_CLIENT_SECRET="$EXISTING_LINEAR_CLIENT_SECRET"
        LINEAR_CLIENT_SECRET_REFRESHED=$(load_existing "LINEAR_CLIENT_SECRET_REFRESHED")
        [ -z "$LINEAR_CLIENT_SECRET_REFRESHED" ] && LINEAR_CLIENT_SECRET_REFRESHED="unknown"
        echo "   ✅ Keeping existing (last refresh: $LINEAR_CLIENT_SECRET_REFRESHED)"
    fi
else
    read -p "   LINEAR_CLIENT_SECRET: " LINEAR_CLIENT_SECRET
    LINEAR_CLIENT_SECRET_REFRESHED=$(date +%Y-%m-%d)
fi

# API_KEY
echo ""
if [ -n "$EXISTING_LINEAR_API_KEY" ]; then
    echo "   Current API_KEY: ${EXISTING_LINEAR_API_KEY:0:12}..."
    read -p "   Keep existing? [Y/n]: " KEEP_API_KEY
    if [[ "$KEEP_API_KEY" =~ ^[Nn]$ ]]; then
        read -p "   New LINEAR_API_KEY: " LINEAR_API_KEY
        LINEAR_API_KEY_REFRESHED=$(date +%Y-%m-%d)
    else
        LINEAR_API_KEY="$EXISTING_LINEAR_API_KEY"
        LINEAR_API_KEY_REFRESHED=$(load_existing "LINEAR_API_KEY_REFRESHED")
        [ -z "$LINEAR_API_KEY_REFRESHED" ] && LINEAR_API_KEY_REFRESHED="unknown"
        echo "   ✅ Keeping existing (last refresh: $LINEAR_API_KEY_REFRESHED)"
    fi
else
    read -p "   LINEAR_API_KEY: " LINEAR_API_KEY
    LINEAR_API_KEY_REFRESHED=$(date +%Y-%m-%d)
fi

# ═══════════════════════════════════════════════════════════════════════════
# VALIDATE API KEY
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "🔍 Validating API key..."

VIEWER_RESPONSE=$(curl -s -X POST https://api.linear.app/graphql \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"query":"{ viewer { id name email } }"}')

if echo "$VIEWER_RESPONSE" | grep -q '"viewer"'; then
    VIEWER_NAME=$(echo "$VIEWER_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    VIEWER_EMAIL=$(echo "$VIEWER_RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Connected as: $VIEWER_NAME ($VIEWER_EMAIL)"
else
    echo "❌ Invalid API key"
    echo "$VIEWER_RESPONSE"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════
# FETCH TEAMS
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "🔍 Fetching teams..."
TEAMS_RESPONSE=$(curl -s -X POST https://api.linear.app/graphql \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"query":"{ teams { nodes { id name key } } }"}')

if echo "$TEAMS_RESPONSE" | grep -q '"teams"'; then
    echo ""
    echo "📋 Available teams:"
    echo "$TEAMS_RESPONSE" | grep -o '"id":"[^"]*","name":"[^"]*","key":"[^"]*"' | while read -r line; do
        TEAM_ID=$(echo "$line" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        TEAM_NAME=$(echo "$line" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        TEAM_KEY=$(echo "$line" | grep -o '"key":"[^"]*"' | cut -d'"' -f4)
        echo "   [$TEAM_KEY] $TEAM_NAME"
        echo "       ID: $TEAM_ID"
    done
fi

echo ""
if [ -n "$EXISTING_LINEAR_TEAM_ID" ]; then
    echo "Current TEAM_ID: $EXISTING_LINEAR_TEAM_ID"
    read -p "Keep existing? [Y/n]: " KEEP_TEAM
    if [[ "$KEEP_TEAM" =~ ^[Nn]$ ]]; then
        read -p "New LINEAR_TEAM_ID: " LINEAR_TEAM_ID
    else
        LINEAR_TEAM_ID="$EXISTING_LINEAR_TEAM_ID"
    fi
else
    read -p "LINEAR_TEAM_ID: " LINEAR_TEAM_ID
fi

# PROJECT_ID (optional)
echo ""
if [ -n "$EXISTING_LINEAR_PROJECT_ID" ]; then
    echo "Current PROJECT_ID: $EXISTING_LINEAR_PROJECT_ID"
    read -p "Keep existing? [Y/n]: " KEEP_PROJECT
    if [[ "$KEEP_PROJECT" =~ ^[Nn]$ ]]; then
        read -p "New LINEAR_PROJECT_ID (or Enter to skip): " LINEAR_PROJECT_ID
    else
        LINEAR_PROJECT_ID="$EXISTING_LINEAR_PROJECT_ID"
    fi
else
    read -p "LINEAR_PROJECT_ID (optional, Enter to skip): " LINEAR_PROJECT_ID
fi

# ═══════════════════════════════════════════════════════════════════════════
# UPDATE .ENV FILE
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "📝 Updating .env..."

# Backup
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$ENV_BACKUP"
    echo "💾 Backup: $ENV_BACKUP"
fi

# Check if Linear section exists
if grep -q '^LINEAR_CLIENT_ID=' "$ENV_FILE" 2>/dev/null; then
    # Update existing values with sed
    sed -i "s|^LINEAR_CLIENT_ID=.*|LINEAR_CLIENT_ID=$LINEAR_CLIENT_ID|" "$ENV_FILE"
    sed -i "s|^LINEAR_CLIENT_SECRET=.*|LINEAR_CLIENT_SECRET=$LINEAR_CLIENT_SECRET|" "$ENV_FILE"
    sed -i "s|^LINEAR_API_KEY=.*|LINEAR_API_KEY=$LINEAR_API_KEY|" "$ENV_FILE"
    sed -i "s|^LINEAR_TEAM_ID=.*|LINEAR_TEAM_ID=$LINEAR_TEAM_ID|" "$ENV_FILE"
    sed -i "s|^LINEAR_PROJECT_ID=.*|LINEAR_PROJECT_ID=$LINEAR_PROJECT_ID|" "$ENV_FILE"
    
    # Update or add refresh dates
    if grep -q '^LINEAR_CLIENT_SECRET_REFRESHED=' "$ENV_FILE"; then
        sed -i "s|^LINEAR_CLIENT_SECRET_REFRESHED=.*|LINEAR_CLIENT_SECRET_REFRESHED=$LINEAR_CLIENT_SECRET_REFRESHED|" "$ENV_FILE"
    else
        sed -i "/^LINEAR_CLIENT_SECRET=/a LINEAR_CLIENT_SECRET_REFRESHED=$LINEAR_CLIENT_SECRET_REFRESHED" "$ENV_FILE"
    fi
    
    if grep -q '^LINEAR_API_KEY_REFRESHED=' "$ENV_FILE"; then
        sed -i "s|^LINEAR_API_KEY_REFRESHED=.*|LINEAR_API_KEY_REFRESHED=$LINEAR_API_KEY_REFRESHED|" "$ENV_FILE"
    else
        sed -i "/^LINEAR_API_KEY=/a LINEAR_API_KEY_REFRESHED=$LINEAR_API_KEY_REFRESHED" "$ENV_FILE"
    fi
    
    echo "✅ Updated Linear variables in .env"
else
    # Append new Linear section
    cat >> "$ENV_FILE" << EOF

# ═══════════════════════════════════════════════════════════════════════════
# LINEAR - PROJECT MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════
# Docs: https://developers.linear.app/docs
# OAuth Apps: https://linear.app/settings/api/applications
# API Keys: https://linear.app/settings/api

# OAuth App credentials (for integrations)
LINEAR_CLIENT_ID=$LINEAR_CLIENT_ID
LINEAR_CLIENT_SECRET=$LINEAR_CLIENT_SECRET
LINEAR_CLIENT_SECRET_REFRESHED=$LINEAR_CLIENT_SECRET_REFRESHED

# Personal API Key (for direct API access)
LINEAR_API_KEY=$LINEAR_API_KEY
LINEAR_API_KEY_REFRESHED=$LINEAR_API_KEY_REFRESHED

# Workspace configuration
LINEAR_TEAM_ID=$LINEAR_TEAM_ID
LINEAR_PROJECT_ID=$LINEAR_PROJECT_ID
EOF
    echo "✅ Added Linear section to .env"
fi

# ═══════════════════════════════════════════════════════════════════════════
# DONE
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║  🎉 Setup Complete!                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "   📄 .env updated: $ENV_FILE"
echo "   💾 Backup saved: $ENV_BACKUP"
echo ""
echo "   🔑 Key refresh dates:"
echo "      LINEAR_CLIENT_SECRET: $LINEAR_CLIENT_SECRET_REFRESHED"
echo "      LINEAR_API_KEY:       $LINEAR_API_KEY_REFRESHED"
echo ""
echo "   💡 Tip: Run with option 2 to generate .env.example"
echo ""
