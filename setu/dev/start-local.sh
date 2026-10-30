#!/usr/bin/env bash
# Starts server, worker and front for local development on ports that do not
# collide with editor tooling on 3000/3001. The root `yarn start` script is
# hard-wired to wait on tcp:3000, so it cannot be reused with other ports.
# Secrets come from Doppler (see ACCESS.md); the values exported here are not
# secret.
#
#   setu/dev/start-local.sh            # server :4000, front :4001
#   SETU_SERVER_PORT=4100 SETU_FRONT_PORT=4101 setu/dev/start-local.sh
#   SETU_DEV_CHATGPT_PLAN=false setu/dev/start-local.sh   # no plan provider

set -euo pipefail

SERVER_PORT="${SETU_SERVER_PORT:-4000}"
FRONT_PORT="${SETU_FRONT_PORT:-4001}"
DOPPLER_PROJECT="${SETU_DOPPLER_PROJECT:-cwi}"
DOPPLER_CONFIG="${SETU_DOPPLER_CONFIG:-dev}"

cd "$(dirname "$0")/../.."

export NODE_ENV=development
export NODE_PORT="$SERVER_PORT"
export SERVER_URL="http://localhost:$SERVER_PORT"
export FRONTEND_URL="http://localhost:$FRONT_PORT"
export REACT_APP_PORT="$FRONT_PORT"
export REACT_APP_SERVER_BASE_URL="http://localhost:$SERVER_PORT"
# Serves chat from the owner's ChatGPT plan after `node setu/dev/chatgpt-plan.mjs
# login`; only honoured when NODE_ENV=development.
export SETU_DEV_CHATGPT_PLAN="${SETU_DEV_CHATGPT_PLAN:-true}"
# The Nx daemon times out building this repo's project graph on first use.
export NX_DAEMON=false

exec doppler run -p "$DOPPLER_PROJECT" -c "$DOPPLER_CONFIG" -- \
  npx concurrently --kill-others --names server,worker,front \
  "npx nx start twenty-server" \
  "npx wait-on tcp:$SERVER_PORT && npx nx run twenty-server:worker" \
  "npx nx start twenty-front"
