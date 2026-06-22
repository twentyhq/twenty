#!/bin/bash
# Validate that Supabase env values point to the same reachable project and
# that the read-only backfill source is configured through either the preferred
# DSN or the REST fallback URL/key pair.
# This script intentionally prints only project refs, presence, and key lengths,
# never secret values.

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

looks_like_service_role_key() {
  local key="$1"
  local payload
  local padded_payload
  local decoded_payload

  case "$key" in
    sb_secret_*|*service_role*|*service-role*)
      return 0
      ;;
  esac

  payload="${key#*.}"
  if [ "$payload" = "$key" ]; then
    return 1
  fi

  payload="${payload%%.*}"
  payload="${payload//-/+}"
  payload="${payload//_/\/}"

  case $((${#payload} % 4)) in
    0) padded_payload="$payload" ;;
    2) padded_payload="${payload}==" ;;
    3) padded_payload="${payload}=" ;;
    *) return 1 ;;
  esac

  decoded_payload="$(printf '%s' "$padded_payload" | base64 --decode 2>/dev/null || true)"
  [[ "$decoded_payload" == *'"role":"service_role"'* || "$decoded_payload" == *'"role": "service_role"'* ]]
}

SUPABASE_URL="$(read_env VITE_SUPABASE_URL)"
PROJECT_ID="$(read_env VITE_SUPABASE_PROJECT_ID)"
DATABASE_URL="$(read_env CONNECTION_STRING)"
ANON_KEY="$(read_env SUPABASE_ANON_KEY)"
PUBLISHABLE_KEY="$(read_env VITE_SUPABASE_PUBLISHABLE_KEY)"
SERVICE_KEY="$(read_env SUPABASE_SERVICE_ROLE_KEY)"
READONLY_DSN="$(read_env XOPURE_SUPABASE_READONLY_DSN)"
READONLY_REST_URL="$(read_env XOPURE_SUPABASE_READONLY_REST_URL)"
READONLY_REST_KEY="$(read_env XOPURE_SUPABASE_READONLY_REST_KEY)"
READONLY_REST_SCHEMA="$(read_env XOPURE_SUPABASE_READONLY_REST_SCHEMA)"
READONLY_REST_SCHEMA="${READONLY_REST_SCHEMA:-public}"

READONLY_REST_URL_STATUS="missing"
READONLY_REST_KEY_STATUS="missing"
[ -n "$READONLY_REST_URL" ] && READONLY_REST_URL_STATUS="present"
[ -n "$READONLY_REST_KEY" ] && READONLY_REST_KEY_STATUS="present"

URL_REF="$SUPABASE_URL"
URL_REF="${URL_REF#https://}"
URL_REF="${URL_REF%%.supabase.co*}"

REST_URL_REF="$READONLY_REST_URL"
REST_URL_REF="${REST_URL_REF#https://}"
REST_URL_REF="${REST_URL_REF%%.supabase.co*}"

DB_REF="$DATABASE_URL"
DB_REF="${DB_REF#*@db.}"
DB_REF="${DB_REF%%.supabase.co*}"

printf 'VITE_SUPABASE_PROJECT_ID: %s\n' "${PROJECT_ID:-missing}"
printf 'VITE_SUPABASE_URL ref:     %s\n' "${URL_REF:-missing}"
printf 'CONNECTION_STRING ref:     %s\n' "${DB_REF:-missing}"
printf 'SUPABASE_ANON_KEY length:  %s\n' "${#ANON_KEY}"
printf 'PUBLISHABLE_KEY length:    %s\n' "${#PUBLISHABLE_KEY}"
printf 'SERVICE_ROLE_KEY length:   %s\n' "${#SERVICE_KEY}"
printf 'READONLY_DSN length:       %s\n' "${#READONLY_DSN}"
printf 'XOPURE_SUPABASE_READONLY_DSN length: %s\n' "${#READONLY_DSN}"
printf 'XOPURE_SUPABASE_READONLY_REST_URL:  %s\n' "$READONLY_REST_URL_STATUS"
printf 'XOPURE_SUPABASE_READONLY_REST_URL ref: %s\n' "${REST_URL_REF:-missing}"
printf 'XOPURE_SUPABASE_READONLY_REST_SCHEMA: %s\n' "$READONLY_REST_SCHEMA"
printf 'XOPURE_SUPABASE_READONLY_REST_KEY:  %s\n' "$READONLY_REST_KEY_STATUS"
printf 'XOPURE_SUPABASE_READONLY_REST_KEY length: %s\n' "${#READONLY_REST_KEY}"

if [ -n "$PROJECT_ID" ] && [ -n "$URL_REF" ] && [ "$PROJECT_ID" != "$URL_REF" ]; then
  echo "ERROR: VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_URL point to different projects." >&2
  exit 2
fi

if [ -n "$DB_REF" ] && [ -n "$URL_REF" ] && [ "$DB_REF" != "$URL_REF" ]; then
  echo "ERROR: CONNECTION_STRING and VITE_SUPABASE_URL point to different projects." >&2
  exit 3
fi

if [ -n "$REST_URL_REF" ] && [ -n "$URL_REF" ] && [ "$REST_URL_REF" != "$URL_REF" ]; then
  echo "ERROR: XOPURE_SUPABASE_READONLY_REST_URL and VITE_SUPABASE_URL point to different projects." >&2
  exit 8
fi

if [ -n "$READONLY_DSN" ] && [[ "$READONLY_DSN" == *"service_role"* ]]; then
  echo "ERROR: XOPURE_SUPABASE_READONLY_DSN must not contain a service-role credential." >&2
  exit 7
fi

if [ -n "$READONLY_REST_KEY" ] && looks_like_service_role_key "$READONLY_REST_KEY"; then
  echo "ERROR: XOPURE_SUPABASE_READONLY_REST_KEY must be a publishable/anon key, not a service-role key." >&2
  exit 8
fi

if [ -n "$READONLY_REST_KEY" ] && [ -n "$SERVICE_KEY" ] && [ "$READONLY_REST_KEY" = "$SERVICE_KEY" ]; then
  echo "ERROR: XOPURE_SUPABASE_READONLY_REST_KEY must not reuse SUPABASE_SERVICE_ROLE_KEY." >&2
  exit 8
fi

if { [ -n "$READONLY_REST_URL" ] && [ -z "$READONLY_REST_KEY" ]; } || { [ -z "$READONLY_REST_URL" ] && [ -n "$READONLY_REST_KEY" ]; }; then
  echo "ERROR: XOPURE_SUPABASE_READONLY_REST_URL and XOPURE_SUPABASE_READONLY_REST_KEY must be set together." >&2
  exit 8
fi

PUBLIC_KEY="${READONLY_REST_KEY:-${PUBLISHABLE_KEY:-$ANON_KEY}}"
SCHEMA_CHECK_KEY="${SERVICE_KEY:-$PUBLIC_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SCHEMA_CHECK_KEY" ]; then
  echo "ERROR: Missing VITE_SUPABASE_URL or a Supabase REST check key." >&2
  exit 4
fi

HTTP_CODE=$(curl -sS -o /dev/null -w '%{http_code}' \
  "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SCHEMA_CHECK_KEY" \
  -H "Authorization: Bearer $SCHEMA_CHECK_KEY")

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Supabase REST schema query failed with HTTP $HTTP_CODE." >&2
  echo "Response body omitted to avoid leaking Supabase details." >&2
  exit 5
fi

PUBLIC_HTTP_CODE=$(curl -sS -o /dev/null -w '%{http_code}' \
  "$SUPABASE_URL/rest/v1/products?select=id&limit=1" \
  -H "apikey: $PUBLIC_KEY" \
  -H "Authorization: Bearer $PUBLIC_KEY")

if [ "$PUBLIC_HTTP_CODE" != "200" ]; then
  echo "ERROR: Supabase public key products query failed with HTTP $PUBLIC_HTTP_CODE." >&2
  echo "Response body omitted to avoid leaking Supabase details." >&2
  exit 6
fi

if [ -z "$READONLY_DSN" ] && [ -z "$READONLY_REST_URL" ]; then
  echo "ERROR: Missing read-only source credentials. Set XOPURE_SUPABASE_READONLY_DSN or the REST fallback URL/key pair." >&2
  exit 7
fi

echo "Supabase env looks consistent, REST schema is reachable, and a read-only source is configured."
