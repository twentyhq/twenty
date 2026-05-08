#!/bin/bash
# Validate that the Supabase URL, project id, service key, and Postgres URL in .env point to the same reachable project.
# This script intentionally prints only project refs and key lengths, never secret values.

set -euo pipefail

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

read_env() {
  local key="$1"
  awk -F= -v k="$key" '$1 == k {v=substr($0, index($0,$2)); gsub(/^"|"$/, "", v); print v; exit}' "$ENV_FILE"
}

SUPABASE_URL="$(read_env VITE_SUPABASE_URL)"
PROJECT_ID="$(read_env VITE_SUPABASE_PROJECT_ID)"
DATABASE_URL="$(read_env CONNECTION_STRING)"
ANON_KEY="$(read_env SUPABASE_ANON_KEY)"
SERVICE_KEY="$(read_env SUPABASE_SERVICE_ROLE_KEY)"

URL_REF="$SUPABASE_URL"
URL_REF="${URL_REF#https://}"
URL_REF="${URL_REF%%.supabase.co*}"

DB_REF="$DATABASE_URL"
DB_REF="${DB_REF#*@db.}"
DB_REF="${DB_REF%%.supabase.co*}"

printf 'VITE_SUPABASE_PROJECT_ID: %s\n' "${PROJECT_ID:-missing}"
printf 'VITE_SUPABASE_URL ref:     %s\n' "${URL_REF:-missing}"
printf 'CONNECTION_STRING ref:     %s\n' "${DB_REF:-missing}"
printf 'SUPABASE_ANON_KEY length:  %s\n' "${#ANON_KEY}"
printf 'SERVICE_ROLE_KEY length:   %s\n' "${#SERVICE_KEY}"

if [ -n "$PROJECT_ID" ] && [ -n "$URL_REF" ] && [ "$PROJECT_ID" != "$URL_REF" ]; then
  echo "ERROR: VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_URL point to different projects." >&2
  exit 2
fi

if [ -n "$DB_REF" ] && [ -n "$URL_REF" ] && [ "$DB_REF" != "$URL_REF" ]; then
  echo "ERROR: CONNECTION_STRING and VITE_SUPABASE_URL point to different projects." >&2
  exit 3
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
  echo "ERROR: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." >&2
  exit 4
fi

HTTP_CODE=$(curl -sS -o /tmp/xopure-supabase-openapi.json -w '%{http_code}' \
  "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY")

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Supabase REST schema query failed with HTTP $HTTP_CODE." >&2
  sed -n '1,4p' /tmp/xopure-supabase-openapi.json >&2 || true
  exit 5
fi

echo "Supabase env looks consistent and REST schema is reachable."
