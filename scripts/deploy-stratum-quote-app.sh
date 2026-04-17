#!/bin/bash
# =============================================================================
# Stratum Quote App — Build + Deploy (UAT/Prod)
# =============================================================================
# Builds an SDK tarball (includes manifest.json) and deploys it to Twenty.
#
# Usage (from repo root `twenty/source`):
#   bash scripts/deploy-stratum-quote-app.sh uat
#   bash scripts/deploy-stratum-quote-app.sh prod
#
# Requirements:
# - WSL / Linux shell
# - nvm installed (we use apps/stratum-quote-app/.nvmrc)
# - Env file at /home/clive/_Projects/stratum/.env containing:
#     TWENTY_UAT_URL,  TWENTY_UAT_API_KEY
#     TWENTY_PROD_URL, TWENTY_PROD_API_KEY
# =============================================================================
set -euo pipefail

info() { echo "=> $*"; }
fail() { echo "   FAIL: $*" >&2; exit 1; }

ENVIRONMENT="${1:-}"
if [[ "$ENVIRONMENT" != "uat" && "$ENVIRONMENT" != "prod" ]]; then
  fail "Usage: bash scripts/deploy-stratum-quote-app.sh <uat|prod>"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$REPO_ROOT/apps/stratum-quote-app"
DOTENV_PATH="/home/clive/_Projects/stratum/.env"

if [[ ! -d "$APP_DIR" ]]; then
  fail "App directory not found: $APP_DIR"
fi
if [[ ! -f "$DOTENV_PATH" ]]; then
  fail ".env not found: $DOTENV_PATH"
fi

cd "$APP_DIR"

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
else
  fail "nvm not found at $HOME/.nvm/nvm.sh"
fi

nvm use >/dev/null

set -a
# shellcheck disable=SC1090
source "$DOTENV_PATH"
set +a

if [[ "$ENVIRONMENT" == "uat" ]]; then
  : "${TWENTY_UAT_URL:?Missing TWENTY_UAT_URL in $DOTENV_PATH}"
  : "${TWENTY_UAT_API_KEY:?Missing TWENTY_UAT_API_KEY in $DOTENV_PATH}"
  export TWENTY_API_URL="${TWENTY_UAT_URL%/}"
  export TWENTY_TOKEN="$TWENTY_UAT_API_KEY"
else
  : "${TWENTY_PROD_URL:?Missing TWENTY_PROD_URL in $DOTENV_PATH}"
  : "${TWENTY_PROD_API_KEY:?Missing TWENTY_PROD_API_KEY in $DOTENV_PATH}"
  export TWENTY_API_URL="${TWENTY_PROD_URL%/}"
  export TWENTY_TOKEN="$TWENTY_PROD_API_KEY"
fi

info "Deploying stratum-quote-app to $ENVIRONMENT"
info "Using TWENTY_API_URL=$TWENTY_API_URL"

node -e '
const { appBuild, appDeploy } = require("twenty-sdk/cli");
(async () => {
  const b = await appBuild({ appPath: process.cwd(), tarball: true, onProgress: console.log });
  if (!b.success) throw new Error(b.error?.message || "Build failed");
  console.log("TARBALL:", b.data.tarballPath);
  const d = await appDeploy({ tarballPath: b.data.tarballPath, onProgress: console.log });
  if (!d.success) throw new Error(d.error?.message || "Deploy failed");
  console.log("DEPLOY_OK");
})().catch((e) => { console.error(e?.stack || e); process.exit(1); });
'

