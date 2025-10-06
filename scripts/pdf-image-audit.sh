#!/usr/bin/env bash
set -euo pipefail

# PDF/IMAGE adoption audit script
# Finds files that reference other composite types but do not reference PDF or IMAGE yet

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
OUTPUT_PATH="${1:-$REPO_ROOT/specs/001-implementation-plan-adding/pdf-image-adoption-audit.md}"

cd "$REPO_ROOT"

# Common composite field types used as signal for likely missing PDF/IMAGE additions
RG_GLOBS=(
  "!**/node_modules/**"
  "!**/dist/**"
  "!**/.next/**"
  "!**/build/**"
  "!**/.turbo/**"
)

COMPOSITE_ENUM_REGEX="FieldMetadataType\\.(CURRENCY|FULL_NAME|ADDRESS|LINKS|ACTOR|EMAILS|PHONES|RICH_TEXT_V2)"
COMPOSITE_STRING_REGEX="'(CURRENCY|FULL_NAME|ADDRESS|LINKS|ACTOR|EMAILS|PHONES|RICH_TEXT_V2)'"

declare -a candidates=()

# Search TypeScript enum references
mapfile -t enum_hits < <(rg -l -S ${RG_GLOBS[@]/#/--glob } "$COMPOSITE_ENUM_REGEX" packages || true)
candidates+=("${enum_hits[@]:-}")

# Search string literal references (frontend often uses string FieldType)
mapfile -t string_hits < <(rg -l -S ${RG_GLOBS[@]/#/--glob } "$COMPOSITE_STRING_REGEX" packages || true)
candidates+=("${string_hits[@]:-}")

# De-duplicate candidate list
readarray -t candidates < <(printf '%s\n' "${candidates[@]}" | awk 'NF' | sort -u)

declare -a results=()
for f in "${candidates[@]}"; do
  # Skip files that already reference PDF or IMAGE
  if rg -q -S ${RG_GLOBS[@]/#/--glob } "FieldMetadataType\\.(PDF|IMAGE)" "$f"; then
    continue
  fi
  if rg -q -S ${RG_GLOBS[@]/#/--glob } "'(PDF|IMAGE)'" "$f"; then
    continue
  fi
  results+=("$f")
done

mkdir -p "$(dirname "$OUTPUT_PATH")"

{
  echo "# PDF/IMAGE Adoption Audit"
  echo
  echo "- Generated: $(date -u +'%Y-%m-%d %H:%M:%SZ')"
  echo "- Repo: $(basename "$REPO_ROOT")"
  echo "- Total files: ${#results[@]}"
  echo
  echo "> Files reference other composite types but do not reference PDF/IMAGE yet."
  echo
  for f in "${results[@]}"; do
    echo "- [ ] \`$f\`"
  done
} >"$OUTPUT_PATH"

echo "Wrote audit to $OUTPUT_PATH"


