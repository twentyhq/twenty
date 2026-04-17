#!/bin/bash
# Full deploy cycle for stratum-quote-app
#
# Steps:
#   1. Deploy tarball to UAT (yarn twenty deploy)
#   2. Get a user JWT via email/password auth
#   3. Uninstall the app (so the new front component bundle is picked up)
#   4. Reinstall the app
#   5. Re-run layout migration 014 (frontComponent id changes on every reinstall)
#   6. Flush the flat entity cache
#
# Prerequisites:
#   - Add TWENTY_UAT_ADMIN_EMAIL and TWENTY_UAT_ADMIN_PASSWORD to
#     /home/clive/_Projects/stratum/.env
#   - railway CLI authenticated
#   - Node 24 via nvm

set -euo pipefail

NODE_PATH='/home/clive/.nvm/versions/node/v24.14.0/bin'
APP_DIR='/home/clive/_Projects/stratum/twenty/source/apps/stratum-quote-app'
MIGRATION='/home/clive/_Projects/stratum/scripts/layout-migrations/014-quote-sections-panel.sql'
API_URL='https://twenty-uat-0a4c.up.railway.app'
ENV_FILE='/home/clive/_Projects/stratum/.env'

export PATH="$NODE_PATH:$PATH"

# ── Load credentials ──────────────────────────────────────────────────────────

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found" >&2; exit 1
fi

# Source only the two vars we need (avoid polluting the environment)
TWENTY_UAT_ADMIN_EMAIL=$(grep '^TWENTY_UAT_ADMIN_EMAIL=' "$ENV_FILE" | cut -d= -f2-)
TWENTY_UAT_ADMIN_PASSWORD=$(grep '^TWENTY_UAT_ADMIN_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)

if [[ -z "$TWENTY_UAT_ADMIN_EMAIL" || -z "$TWENTY_UAT_ADMIN_PASSWORD" ]]; then
  echo "ERROR: TWENTY_UAT_ADMIN_EMAIL and TWENTY_UAT_ADMIN_PASSWORD must be set in $ENV_FILE" >&2
  exit 1
fi

# ── 1. Deploy tarball ─────────────────────────────────────────────────────────

echo "=== [1/6] Deploying tarball ==="
cd "$APP_DIR"
yarn twenty deploy --remote uat

# ── 2. Get user JWT ───────────────────────────────────────────────────────────

echo "=== [2/6] Obtaining user JWT ==="

LOGIN_RESP=$(curl -sf -X POST "$API_URL/metadata" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation { getLoginTokenFromCredentials(email: \\\"$TWENTY_UAT_ADMIN_EMAIL\\\", password: \\\"$TWENTY_UAT_ADMIN_PASSWORD\\\", origin: \\\"$API_URL\\\") { loginToken { token } } }\"}" )

LOGIN_TOKEN=$(echo "$LOGIN_RESP" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d['data']['getLoginTokenFromCredentials']['loginToken']['token'])" \
  2>/dev/null || { echo "ERROR: login failed — check credentials"; echo "$LOGIN_RESP" >&2; exit 1; })

AUTH_RESP=$(curl -sf -X POST "$API_URL/metadata" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation { getAuthTokensFromLoginToken(loginToken: \\\"$LOGIN_TOKEN\\\", origin: \\\"$API_URL\\\") { tokens { accessOrWorkspaceAgnosticToken { token } } } }\"}" )

ACCESS_TOKEN=$(echo "$AUTH_RESP" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d['data']['getAuthTokensFromLoginToken']['tokens']['accessOrWorkspaceAgnosticToken']['token'])" \
  2>/dev/null || { echo "ERROR: could not extract access token"; echo "$AUTH_RESP" >&2; exit 1; })

echo "JWT obtained."

# ── 3. Uninstall ──────────────────────────────────────────────────────────────

echo "=== [3/6] Uninstalling app ==="
cd "$APP_DIR"
TWENTY_TOKEN="$ACCESS_TOKEN" yarn twenty uninstall --remote uat --yes

# ── 4. Reinstall ─────────────────────────────────────────────────────────────

echo "=== [4/6] Installing app ==="
TWENTY_TOKEN="$ACCESS_TOKEN" yarn twenty install --remote uat

# ── 5. Layout migration ───────────────────────────────────────────────────────

echo "=== [5/6] Running layout migration ==="
B64=$(base64 -w0 "$MIGRATION")
railway ssh --service twenty --environment uat -- \
  "printf '%s' '$B64' | base64 -d > /tmp/m.sql && psql \"\$PG_DATABASE_URL\" -f /tmp/m.sql"

# ── 6. Flush cache ────────────────────────────────────────────────────────────

echo "=== [6/6] Flushing metadata cache ==="
railway ssh --service twenty --environment uat -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flat-cache-invalidate --all-metadata" \
  2>&1 | grep -E "Successfully|completed|ERROR" || true

echo ""
echo "=== Done! Hard-refresh the browser. ==="
