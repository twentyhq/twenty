#!/bin/bash
# Apply a SQL file to the configured Supabase project through the Management API.
# This avoids local Docker/pg_dump requirements and intentionally never prints credentials.

set -euo pipefail

SQL_FILE="${1:-}"
ENV_FILE="${2:-.env}"

if [ -z "$SQL_FILE" ] || [ ! -f "$SQL_FILE" ]; then
  echo "Usage: $0 <sql-file> [env-file]" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

read_env() {
  local key="$1"
  awk -F= -v k="$key" '$1 == k {v=substr($0, index($0,$2)); gsub(/^"|"$/, "", v); print v; exit}' "$ENV_FILE"
}

PROJECT_ID="$(read_env VITE_SUPABASE_PROJECT_ID)"
ACCESS_TOKEN="$(read_env SUPABASE_ACCESS_TOKEN)"

if [ -z "$PROJECT_ID" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "Missing VITE_SUPABASE_PROJECT_ID or SUPABASE_ACCESS_TOKEN in $ENV_FILE" >&2
  exit 2
fi

BODY_FILE="$(mktemp /private/tmp/xopure-supabase-query.XXXXXX.json)"
RESPONSE_FILE="$(mktemp /private/tmp/xopure-supabase-response.XXXXXX.json)"
trap 'rm -f "$BODY_FILE" "$RESPONSE_FILE"' EXIT

SQL_FILE="$SQL_FILE" node -e '
const fs = require("fs");
const query = fs.readFileSync(process.env.SQL_FILE, "utf8");
process.stdout.write(JSON.stringify({ query, read_only: false }));
' > "$BODY_FILE"

HTTP_CODE=$(curl -sS -o "$RESPONSE_FILE" -w '%{http_code}' \
  -X POST "https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary "@$BODY_FILE")

if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "201" ]; then
  echo "Supabase SQL apply failed with HTTP $HTTP_CODE" >&2
  sed -n '1,20p' "$RESPONSE_FILE" >&2
  exit 3
fi

printf 'Applied %s to Supabase project %s (HTTP %s).\n' "$SQL_FILE" "$PROJECT_ID" "$HTTP_CODE"
