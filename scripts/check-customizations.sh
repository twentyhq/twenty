#!/usr/bin/env bash
# check-customizations.sh — Run after merging upstream to detect overwritten customizations
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

check_file_contains() {
  local file="$1"
  local pattern="$2"
  local description="$3"

  if [ ! -f "$file" ]; then
    echo -e "${RED}MISSING${NC} $file — $description"
    ERRORS=$((ERRORS + 1))
    return
  fi

  if ! grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${RED}OVERWRITTEN${NC} $file — $description"
    echo "  Expected pattern: $pattern"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}OK${NC} $file"
  fi
}

check_file_exists() {
  local file="$1"
  local description="$2"

  if [ ! -f "$file" ]; then
    echo -e "${RED}MISSING${NC} $file — $description"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}OK${NC} $file"
  fi
}

check_file_not_contains() {
  local file="$1"
  local pattern="$2"
  local description="$3"

  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}SKIP${NC} $file (not found)"
    return
  fi

  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${RED}REVERTED${NC} $file — $description"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}OK${NC} $file"
  fi
}

echo "============================================"
echo "  Omnia Customization Check"
echo "============================================"
echo ""

echo "--- Critical: RLS Indirect Relation Resolution ---"
check_file_contains \
  "packages/twenty-front/src/modules/object-record/hooks/useBuildRecordInputFromRLSPredicates.ts" \
  "intermediateObjectInfo" \
  "Indirect RLS resolution (Agent→WM) — members can't create policies without this"

echo ""
echo "--- Critical: Organization Plan Gate Removed ---"
check_file_not_contains \
  "packages/twenty-front/src/modules/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectForm.tsx" \
  "isRLSBillingEntitlementEnabled" \
  "Organization plan gate should be removed — RLS always enabled"

echo ""
echo "--- Custom Server Modules ---"
check_file_exists \
  "packages/twenty-server/src/modules/agent-profile/services/agent-profile-resolver.service.ts" \
  "AgentProfile resolver service"
check_file_exists \
  "packages/twenty-server/src/modules/policy/query-hooks/policy-create-one.pre-query.hook.ts" \
  "Policy create pre-query hook (agentId auto-assign)"
check_file_exists \
  "packages/twenty-server/src/modules/policy/query-hooks/policy-create-many.pre-query.hook.ts" \
  "Policy create-many pre-query hook"
check_file_exists \
  "packages/twenty-server/src/modules/call/query-hooks/call-create-one.pre-query.hook.ts" \
  "Call create pre-query hook"
check_file_exists \
  "packages/twenty-server/src/modules/lead/query-hooks/lead-create-one.pre-query.hook.ts" \
  "Lead create pre-query hook"

echo ""
echo "--- Policy Pre-Query Hook: agentId Assignment ---"
check_file_contains \
  "packages/twenty-server/src/modules/policy/query-hooks/policy-create-one.pre-query.hook.ts" \
  "agentProfileResolverService" \
  "Pre-query hook must use AgentProfileResolverService for agentId"

echo ""
echo "--- Spreadsheet Import: Relation Update Fields ---"
check_file_contains \
  "packages/twenty-front/src/modules/spreadsheet-import/types/SpreadsheetImportField.ts" \
  "isRelationUpdateField" \
  "Relation update field support for CSV import"
check_file_exists \
  "packages/twenty-front/src/modules/object-record/spreadsheet-import/utils/extractRelationUpdatesFromImportedRows.ts" \
  "Extract relation updates utility"
check_file_exists \
  "packages/twenty-front/src/modules/object-record/spreadsheet-import/utils/executeRelationUpdatesViaMutation.ts" \
  "Execute relation updates utility"

echo ""
echo "--- CSV Export: Composite Field Splitting ---"
check_file_not_contains \
  "packages/twenty-front/src/modules/object-record/object-options-dropdown/hooks/useExportProcessRecordsForCSV.ts" \
  "formatPhoneNumber" \
  "Composite fields should be kept as objects, not flattened"

echo ""
echo "--- Whitespace Trimming ---"
check_file_contains \
  "packages/twenty-front/src/modules/spreadsheet-import/utils/dataMutations.ts" \
  "trim()" \
  "Validation should trim whitespace"

echo ""
echo "--- RLS Engine: Indirect Relation + Deny-by-Default ---"
check_file_contains \
  "packages/twenty-server/src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util.ts" \
  "isDirectRelation" \
  "Backend RLS must support indirect relations"
check_file_contains \
  "packages/twenty-server/src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util.ts" \
  "00000000-0000-0000-0000-000000000000" \
  "Deny-by-default when predicates can't resolve"

echo ""
echo "--- Unique Constraint: Phone (not Email) ---"
check_file_contains \
  "packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/index/compute-person-standard-flat-index-metadata.util.ts" \
  "phonesUniqueIndex" \
  "Person unique index should be on phones"
check_file_not_contains \
  "packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/index/compute-person-standard-flat-index-metadata.util.ts" \
  "emailsUniqueIndex" \
  "Email unique index should NOT exist"

echo ""
echo "--- Lingui Translations ---"
if grep -q "Show All Objects in Sidebar" "packages/twenty-front/src/locales/en.po" 2>/dev/null; then
  echo -e "${GREEN}OK${NC} Lingui translations contain custom strings"
else
  echo -e "${YELLOW}WARNING${NC} Custom Lingui strings missing — run: npx nx run twenty-front:lingui:extract && npx nx run twenty-front:lingui:compile"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "============================================"
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}  $ERRORS ERRORS found — customizations were overwritten!${NC}"
  echo "  Review CUSTOMIZATIONS.md and restore the missing changes."
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}  $WARNINGS WARNINGS — minor issues to fix${NC}"
  exit 0
else
  echo -e "${GREEN}  All customizations intact!${NC}"
  exit 0
fi
