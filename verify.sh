#!/usr/bin/env bash
# Local gate for the eMobility-Innovations fork of twentyhq/twenty.

set -euo pipefail

cd "$(dirname "$0")"

echo "gate: GitHub Actions workflows must remain absent"
./check-no-workflows.sh

echo "gate: org-specific application changes must have targeted checks"
if ! git rev-parse --verify -q upstream/main >/dev/null; then
  echo "fork-scope: upstream/main is unavailable; cannot prove the fork's change scope." >&2
  echo "fork-scope: fetch the configured upstream remote, then run ./verify.sh again." >&2
  exit 1
fi

unexpected="$({
  git diff --name-only upstream/main...HEAD
  git diff --name-only
  git diff --cached --name-only
  git ls-files --others --exclude-standard
} | sort -u | grep -Ev '^($|\.githooks/pre-push|\.sync-upstream\.conf|README\.md|check-no-workflows\.sh|docs/UPSTREAM-DIVERGENCE\.md|install-hooks\.sh|sync-upstream\.sh|verify\.sh|\.github/workflows/.*)$' || true)"

if [ -n "$unexpected" ]; then
  {
    echo "fork-scope: org-specific application paths now differ from upstream/main:"
    echo "$unexpected" | sed 's/^/    /'
    echo
    echo "  This deployment fork currently has no application-code delta, so reproducing"
    echo "  upstream's monorepo CI locally would check code this org does not change. Add"
    echo "  targeted gates for these paths before they are allowed into the fork."
  } >&2
  exit 1
fi

echo "fork-scope: no org-specific application-code changes — good."
echo "verify: all local gates passed."
