# Upstream Sync — Manual vs Automated

## Short answer

**Semi-automated.** A GitHub Action opens a weekly PR from `twentyhq/twenty` `main`. You (or an agent) review it, fix white-label patch conflicts if any, merge, tag, and let the Docker publish workflow run.

There is **no** auto-merge to `main` — that would silently overwrite white-label patches when upstream touches the same files.

## What runs automatically

Workflow: `.github/workflows/tofu-upstream-sync.yaml`

| Trigger | When |
|---|---|
| Schedule | Every Monday 14:00 UTC |
| Manual | Actions → "TOFU sync upstream Twenty" → Run workflow |

It:

1. Fetches `upstream/main`
2. Merges into branch `upstream/sync-YYYY-MM-DD`
3. Opens a PR against `main` with merge status (`clean` or `conflicts`)

## What you do after the PR opens

1. Read the PR diff — focus on files in the [Active Core Patches](FORK-MANAGEMENT.md#active-core-patches-track-these-on-every-upstream-merge) table
2. If conflicts: re-apply TOFU white-label intent (see FORK-MANAGEMENT.md re-apply steps)
3. Merge the PR
4. Tag a release: `git tag v2.8.4-tofu && git push origin v2.8.4-tofu`
5. Docker publish workflow builds `ghcr.io/bcharleson/tofu-twenty:<tag>`
6. In `twenty-crm-launch`: `./bin/update-instance.sh tofu --pin v2.8.4-tofu`

## Manual sync (same as before)

```bash
cd ~/Developer/tofu-twenty-crm
git checkout main && git pull origin main
git fetch upstream
git merge upstream/main
# fix conflicts, test, push
git push origin main
```

Use manual sync when Twenty ships something urgent mid-week and you cannot wait for Monday's PR.
