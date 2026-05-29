# Fork Management — Strategy & Upstream Sync

This fork (`bcharleson/tofu-twenty-crm`) tracks `twentyhq/twenty`. Here's the full strategy and operating playbook.

---

## The Three-Layer Strategy

This is a deliberate decision made after fully evaluating Twenty's architecture (Apr 25 2026). Do not deviate from this without a documented reason.

```
┌─────────────────────────────────────────────────────┐
│  Layer 3 — TOFU Apps  (separate repo: tofu-twenty-apps)   │
│  Custom objects · Vertical templates · AI agents     │
│  Workflows · Dashboards · Onboarding flows           │
│  PROPRIETARY — this is where TOFU's IP lives         │
├─────────────────────────────────────────────────────┤
│  Layer 2 — THIS REPO (tofu-twenty-crm)               │
│  White-label patches · Per-user AI provider          │
│  Minimal core changes · Pinned to tested releases    │
│  AGPL — keep public, keep minimal                    │
├─────────────────────────────────────────────────────┤
│  Layer 1 — Upstream (twentyhq/twenty)                │
│  Core CRM engine · We pull from here monthly         │
│  We contribute back where it makes sense             │
└─────────────────────────────────────────────────────┘
```

### Why three layers?

**The fork (Layer 2) stays thin** so merging upstream never becomes a maintenance nightmare. The fewer lines we own in core, the cheaper sync is.

**The apps (Layer 3) are the business.** Twenty gives every competitor the same base CRM. Our vertical templates, AI agents, and domain expertise are what clients actually pay for — and they live outside AGPL reach.

**Upstream (Layer 1) is free R&D.** Twenty ships frequently. Every database feature, workflow improvement, and AI tool they build lands in our fork with a monthly pull. We get those for free by staying close.

---

## Remotes (already configured)

```bash
git remote -v
# origin    https://github.com/bcharleson/tofu-twenty-crm.git  (our fork)
# upstream  https://github.com/twentyhq/twenty.git             (Twenty official)
```

## Pull Latest Changes from Upstream

Do this monthly:

```bash
cd ~/Developer/tofu-twenty-crm

git checkout main
git fetch upstream
git merge upstream/main

git push origin main
```

When merging: check the [Active Core Patches](#active-core-patches) table below — those files are the only ones likely to conflict.

## Golden Rule — Keep the Fork Thin

**What belongs in this repo (core patches):**
- White-label UI changes (logo, ToS links, email sender name)
- Per-user AI provider feature (ChatGPT OAuth, Ollama) — too deep for an app, valuable enough to own
- Critical bug fixes before upstream ships them
- Nothing else

**What does NOT belong in this repo:**
- Client-specific objects, pipelines, automations
- Vertical CRM templates
- TOFU's competitive features and AI agents
- Anything you'd have to re-merge every time Twenty ships

All TOFU IP lives in the **separate repo** `bcharleson/tofu-twenty-apps`, built as `twenty-sdk` consumers. This is the AGPL-clean path — our sauce stays proprietary because it's not a modification of core.

## Upstream Contribution Strategy

When we build a core feature (like per-user AI provider selection), **always try to upstream it first.** If the Twenty team accepts it, they maintain it forever and we drop it from our patch list. Win-win.

Steps:
1. Build the feature on a `tofu/<feature>` branch
2. Open a PR against `twentyhq/twenty`
3. If merged: delete our branch, it flows back to us in the next monthly pull
4. If rejected/ignored after 30 days: promote to an active patch and maintain it ourselves

## When We MUST Patch Core

If we hit a bug or need a feature that isn't in Twenty yet:

**Preferred:** open a PR against `twentyhq/twenty` upstream and get it merged. Twenty's team is responsive. See [Upstream Contribution Strategy](#upstream-contribution-strategy) above.

**Fallback:** maintain the patch on a branch named `tofu/<feature-name>`. Rebase onto `upstream/main` periodically. Merge to `main` only when the feature is stable — and add it to the Active Core Patches table immediately.

## Active Core Patches (track these on every upstream merge)

These are intentional changes to Twenty core files. Check each during every upstream sync — they are the most likely to have merge conflicts.

| Patch | Files changed | Why | Added |
|---|---|---|---|
| **White-label sign-in logo** | `Logo.tsx`, `SignInUp.tsx` | No Twenty "20" icon on auth; workspace logo only | Apr 25 2026 |
| **White-label defaults** | `DefaultWorkspaceLogo.ts`, `DefaultWorkspaceName.ts`, `PageFavicon.tsx`, `title-utils.ts`, `index.html`, `workspace-branding/*` | Remove Twenty CDN logo fallback, generic tab/meta titles, favicon/PWA manifest/apple-touch-icon from workspace logo; server injects crawler-visible branding for link previews | May 26 2026 |
| **White-label auth copy** | `SignInUp.tsx`, `FooterNote.tsx` | Generic welcome text; hide Twenty ToS/Privacy links on sign-in | May 26 2026 |
| **White-label timeline** | `getTimelineActivityAuthorFullName.ts` | System events show "System" not "Twenty" | May 26 2026 |

### How to re-apply after an upstream merge conflict

If `Logo.tsx` or `SignInUp.tsx` conflict on merge:

1. Accept upstream's version first (`git checkout --theirs <file>`)
2. Re-apply our change:
   - `SignInUp.tsx`: ensure `<Logo>` receives `primaryLogo={workspacePublicData?.logo}` (not `secondaryLogo`)
   - `Logo.tsx`: ensure `defaultPrimaryLogoUrl` fallback is removed; when `primaryLogo` is null/undefined render nothing instead of the Twenty icon
3. See `tofu/CLIENT-CUSTOMIZATION.md` Section 9 for the full description of the intent

## How Deployments, Docker, and Logos Fit Together

Two repos — do not mix source and ops:

| Repo | Role | Contains |
|---|---|---|
| **`bcharleson/tofu-twenty-crm`** (this repo) | Product fork | Twenty source + white-label patches. Builds the Docker image. |
| **`bcharleson/twenty-crm-launch`** (ops repo) | Fleet launcher | `fleet.json`, `instances/<slug>/`, compose templates, `bin/provision-instance.sh`. **No Twenty source.** |

### Why not `twentycrm/twenty` from Docker Hub?

The official image is built from upstream Twenty. It still shows Twenty branding (default logo CDN, auth copy, favicon bundle). **Every TOFU deployment must run an image built from this fork** after white-label patches are merged.

Build path (from repo root):

```bash
docker build -f packages/twenty-docker/twenty/Dockerfile -t ghcr.io/bcharleson/tofu-twenty:v2.8.3 .
docker push ghcr.io/bcharleson/tofu-twenty:v2.8.3
```

The launch repo's compose file sets `image: ghcr.io/bcharleson/tofu-twenty:v2.8.3` (pinned tag, not `latest`).

### Logo / branding: two layers

**Layer 1 — Fork (same for all instances, baked into the image)**

Removes Twenty fallbacks so the app never shows the "20" icon, Twenty CDN logo, or "Welcome to Twenty" when no client config exists. See [Active Core Patches](#active-core-patches-track-these-on-every-upstream-merge).

**Layer 2 — Per instance (no code, stored in DB + env)**

After provisioning, on each instance:

1. **Settings → General → Logo** — upload client PNG/SVG (192×192 min). This drives sign-in page, nav drawer, browser favicon, installed PWA icon (`PageFavicon`), and **Slack/link preview thumbnails** (server injects `og:image` + `/favicon.ico` redirect from this logo). After a logo change, remove and re-install the PWA so Chrome picks up the new manifest. Slack may cache old previews for a while.
2. **Settings → General → Workspace name** — e.g. "Acme Corp CRM" (tab titles, invites).
3. **Instance `.env`** (launch repo `instances/<slug>/.env`):
   ```env
   EMAIL_FROM_NAME="Acme Corp CRM"
   EMAIL_FROM_ADDRESS=crm@clientdomain.com
   SERVER_URL=https://crm.clientdomain.com
   ```

Logos are **not** copied into the Docker image per client. One fork image serves all clients; each workspace's logo lives in Postgres/file storage after upload.

### Staying current with upstream without losing branding

```
upstream/twenty (twentyhq/twenty)
        │  monthly: git fetch upstream && git merge upstream/main
        ▼
tofu-twenty-crm/main  ← white-label patches live here (small diff)
        │  tag + CI: docker build → ghcr.io/bcharleson/tofu-twenty:vX.Y.Z
        ▼
twenty-crm-launch     ← bump image tag in instance config, run update-instance.sh
        ▼
client droplet        ← docker compose pull && up; workspace logo unchanged in DB
```

On every upstream merge: walk the Active Core Patches table. If a patched file conflicts, re-apply our intent (see re-apply steps above). Client logos in the database are unaffected by image upgrades.

## Pinning to a Specific Upstream Version (for client deployments)

Instead of always running `latest`, pin client deployments to a tagged release:

```bash
git checkout tags/v2.2.0 -b releases/v2.2.0-tofu
```

In docker-compose, set:

```env
TAG=v2.2.0
```

This guarantees client instances don't break overnight when Twenty ships breaking changes. Upgrade each client instance deliberately after testing.

## Release Cadence to Clients

1. **Weekly:** pull upstream to our fork's `main`
2. **Monthly:** test against our internal reference deployment (`crm.topoffunnel.com` — to be set up)
3. **Quarterly or on-demand:** upgrade client deployments to the latest tagged release

## Emergency Freeze

If Twenty changes its license (Mongo/Elastic/HashiCorp style) or we lose upstream trust, we can freeze at the last AGPL-licensed commit and maintain our own hardened fork. 45k GitHub stars means the community would also fork — we wouldn't be alone.

The last known AGPL commit as of this doc's writing is `main` at `v2.2.0` — April 24, 2026.
