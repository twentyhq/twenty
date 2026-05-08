#!/bin/bash
# setup.sh — bootstrap helper for first-time setup
#
# Run once before deploying. Generates the secrets you'll paste into Railway,
# verifies you have the right CLI tools, and prints next-step instructions.

set -euo pipefail

cd "$(dirname "$0")"

echo "════════════════════════════════════════════════════════════════════"
echo "  XO Pure — Twenty CRM bootstrap"
echo "════════════════════════════════════════════════════════════════════"
echo

# ─── 1. Verify prerequisites ────────────────────────────────────────────────
need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Missing: $1"
    echo "   Install: $2"
    exit 1
  fi
  echo "✓ $1 ($(command -v "$1"))"
}

echo "Checking prerequisites..."
need_cmd railway "npm i -g @railway/cli  (or: brew install railwayapp/railway/railway)"
need_cmd openssl "(should already be installed)"
need_cmd jq      "brew install jq"
echo

# ─── 2. Verify Railway login ────────────────────────────────────────────────
if ! railway whoami >/dev/null 2>&1; then
  echo "Not logged in to Railway. Running 'railway login'..."
  railway login
fi
echo "✓ Logged in to Railway as: $(railway whoami 2>&1 | head -1)"
echo

# ─── 3. Generate secrets ────────────────────────────────────────────────────
if [ -f .env.xopure ]; then
  echo "⚠  .env.xopure already exists. Not overwriting. Delete it first to regenerate."
  exit 0
fi

echo "Generating secrets..."
APP_SECRET=$(openssl rand -base64 64 | tr -d '\n')
BACKUP_KEY=$(openssl rand -base64 48 | tr -d '\n')

cp .env.xopure.example .env.xopure
# Use a portable in-place sed (works on both GNU and BSD)
sed -i.bak "s|^APP_SECRET=.*|APP_SECRET=${APP_SECRET}|" .env.xopure
sed -i.bak "s|^BACKUP_ENCRYPTION_KEY=.*|BACKUP_ENCRYPTION_KEY=${BACKUP_KEY}|" .env.xopure
rm -f .env.xopure.bak

echo "✓ Generated APP_SECRET (64 bytes)"
echo "✓ Generated BACKUP_ENCRYPTION_KEY (48 bytes)"
echo
echo "════════════════════════════════════════════════════════════════════"
echo "  ⚠  IMPORTANT — store these in 1Password NOW:"
echo "════════════════════════════════════════════════════════════════════"
echo
echo "APP_SECRET:"
echo "  ${APP_SECRET}"
echo
echo "BACKUP_ENCRYPTION_KEY:"
echo "  ${BACKUP_KEY}"
echo
echo "If you lose BACKUP_ENCRYPTION_KEY, your encrypted R2 backups are"
echo "unrecoverable. If you lose APP_SECRET after deploy, all sessions"
echo "invalidate and Twenty's encrypted-at-rest values become unreadable."
echo
echo "════════════════════════════════════════════════════════════════════"
echo "  Next: open RUNBOOK.md → 'Initial deploy' and follow steps 1–6"
echo "════════════════════════════════════════════════════════════════════"
