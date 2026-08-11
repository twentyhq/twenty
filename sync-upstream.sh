#!/usr/bin/env bash
# sync-upstream.sh — merge upstream into this repo WITHOUT re-fighting the workflow deletion.
#
# TEMPLATE. Canonical copy: claude-code-policy/policy/gate-template/sync-upstream.sh.
# Copy into a repo together with .sync-upstream.conf, which names the remote and branch.
#
# THE PROBLEM THIS SOLVES
# -----------------------
# This repo tracks an upstream codebase, and its .github/workflows were deleted (Actions cannot run
# for this org — billing — so every one of them reported failure for an account reason and checked
# nothing). Deleting files upstream still maintains is a base-file divergence, and it shows up on
# every sync in two very different shapes:
#
#   LOUD   upstream MODIFIES a workflow we deleted  -> delete/modify conflict, git stops, a human
#          has to type something. Annoying, but safe: nothing happens without a decision.
#   SILENT upstream ADDS a workflow                 -> merges cleanly, no conflict, no review
#          comment, invisible among a thousand other upstream files. The repo has CI again and
#          nobody knows.
#
# The silent one is the reason this script exists, and the reason ./check-no-workflows.sh is a GATE
# rather than a note in the README.
#
# WHAT IT DOES
# ------------
# Merges upstream, then applies exactly ONE deterministic policy: everything under
# .github/workflows/ is removed, whether it arrived as a conflict or as a clean addition. That is
# not a judgement call, so a script may make it.
#
# EVERY OTHER CONFLICT STOPS THE SCRIPT AND IS LEFT FOR A HUMAN. There is deliberately no
# `-X ours` / `-X theirs` anywhere in here: those pick a side without reading, which loses one of
# the two intentions in the conflict. Real code conflicts are what a person is for.
#
#   ./sync-upstream.sh          fetch, merge, drop workflows, commit if nothing else conflicts

set -uo pipefail
cd "$(dirname "$0")" || exit 1

# Per-repo settings live beside the script so the script itself stays identical everywhere.
UPSTREAM_REMOTE="${UPSTREAM_REMOTE:-upstream}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-main}"
[ -f .sync-upstream.conf ] && . ./.sync-upstream.conf

WF=".github/workflows"

die() { printf 'sync-upstream: %s\n' "$*" >&2; exit 1; }

git rev-parse --git-dir >/dev/null 2>&1 || die "not a git repository."

# A merge on top of uncommitted work mixes someone else's in-flight edits into the merge commit.
[ -z "$(git status --porcelain)" ] || die \
  "working tree is dirty — commit or stash first, so the merge commit contains only the merge."

git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1 || die \
  "no '$UPSTREAM_REMOTE' remote. Add it:  git remote add $UPSTREAM_REMOTE <upstream-url>"

printf 'sync-upstream: fetching %s...\n' "$UPSTREAM_REMOTE"
git fetch --quiet "$UPSTREAM_REMOTE" || die "fetch failed."

REF="${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}"
git rev-parse --verify -q "$REF" >/dev/null || die "no such ref: $REF"

if [ -z "$(git rev-list -1 HEAD.."$REF")" ]; then
  echo "sync-upstream: already up to date with $REF — nothing to merge."
  exit 0
fi

# What upstream is about to hand us under .github/workflows, recorded BEFORE the merge so it can be
# reported even for files that merge in cleanly and would otherwise leave no trace.
incoming="$(git ls-tree -r --name-only "$REF" -- "$WF" 2>/dev/null | sort)"

printf 'sync-upstream: merging %s (no commit yet)...\n' "$REF"
git merge --no-commit --no-ff "$REF" >/dev/null 2>&1
merge_rc=$?

# A merge can fail BEFORE it starts — unrelated histories, a refusal to overwrite an untracked
# file. There is no merge in progress then, and the removal below would be deleting workflows from
# an ordinary HEAD rather than resolving a merge. Distinguish the two by MERGE_HEAD, not by rc.
if [ "$merge_rc" -ne 0 ] && ! git rev-parse --verify -q MERGE_HEAD >/dev/null; then
  git merge --abort 2>/dev/null || true
  die "merge of $REF could not start (unrelated histories, or an untracked file in the way).
                Nothing was changed. Run 'git merge $REF' by hand to see git's own message."
fi

# ---------------------------------------------------------------------------
# THE ONE AUTOMATIC RESOLUTION: workflows go. Conflicted or clean, staged or not.
# `--ignore-unmatch` so a sync that brings none of them is not an error.
# ---------------------------------------------------------------------------
git rm -r -q --force --ignore-unmatch -- "$WF" >/dev/null 2>&1 || true
rm -rf -- "$WF" 2>/dev/null || true

# Anything still conflicted is real code. Stop; do not guess.
unresolved="$(git diff --name-only --diff-filter=U 2>/dev/null)"
if [ -n "$unresolved" ]; then
  {
    echo
    echo "sync-upstream: the workflow removal was applied, but REAL conflicts remain:"
    echo "$unresolved" | sed 's/^/    /'
    echo
    echo "  These are code, not policy — resolve them by reading both sides. Keep both"
    echo "  intentions; do not reach for --ours or --theirs. Then:"
    echo "      ./verify.sh && git commit"
    echo
    echo "  To abandon the whole sync:  git merge --abort"
  } >&2
  exit 1
fi

if [ -n "$incoming" ]; then
  msg="chore: sync $REF (dropping upstream .github/workflows)

Upstream carries workflows this org cannot run — GitHub Actions is blocked
org-wide by a billing condition, so each one reports failure for an account
reason and checks nothing. This repo's gate is ./verify.sh, enforced by
.githooks/pre-push, and ./check-no-workflows.sh fails if they come back.

Removed on this merge:
$(echo "$incoming" | sed 's/^/  /')"
else
  msg="chore: sync $REF"
fi

git commit --quiet --no-edit -m "$msg" || die "merge commit failed."

echo
echo "sync-upstream: merged $REF."
if [ -n "$incoming" ]; then
  echo "sync-upstream: dropped $(echo "$incoming" | grep -c .) upstream workflow file(s):"
  echo "$incoming" | sed 's/^/    /'
fi
echo "sync-upstream: run ./verify.sh before pushing (the pre-push hook will anyway)."
