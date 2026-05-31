# White-Label Reference — TOFU Fork

What we strip or replace so client deployments never show Twenty branding. Use this when onboarding a client **and** when merging upstream.

---

## Two layers (do both)

| Layer | Where | What it controls |
|---|---|---|
| **Fork (image)** | This repo → Docker image | Default fallbacks when no workspace config exists; server-side first paint |
| **Instance (DB + env)** | Settings → General + `.env` | Client logo, workspace name, email sender |

**Never use `twentycrm/twenty` from Docker Hub** — it ships Twenty icons and copy. Always `ghcr.io/bcharleson/tofu-twenty:<tag>` built from this fork.

---

## Fork patches (Active Core Patches)

Full table and re-apply steps: [FORK-MANAGEMENT.md](./FORK-MANAGEMENT.md#active-core-patches-track-these-on-every-upstream-merge).

### Sign-in & nav logo

| File | Intent |
|---|---|
| `Logo.tsx` | No Twenty CDN fallback; render nothing if no workspace logo |
| `SignInUp.tsx` | Workspace logo as **primary** (large centered), not secondary overlay |

### Favicon, PWA, link previews (May 2026)

| File | Intent |
|---|---|
| `app.module.ts` | `ServeStaticModule` with `serveStaticOptions: { index: false }` so SPA HTML is served by branding middleware, not raw static `index.html` |
| `workspace-branding.middleware.ts` | Injects branded HTML on first GET (title, og:*, favicon links) |
| `workspace-branding.controller.ts` | `GET /favicon.ico` → 302 to signed workspace logo URL |
| `workspace-branding.service.ts` | Resolves workspace from request origin; reads `dist/front/index.html` via `get-front-index-html-path.util.ts` |
| `inject-workspace-branding-into-index-html.util.ts` | Uses stable `/favicon.ico` for icon + apple-touch-icon; direct logo URL for `og:image` only |
| `PageFavicon.tsx` | Client-side manifest blob + helmet links use `/favicon.ico` (not expiring signed URLs) |
| `public/manifest.json` | Fallback manifest points at `/favicon.ico` only — **no** Twenty android-launcher icons |

### Copy & system labels

| File | Intent |
|---|---|
| `SignInUp.tsx`, `FooterNote.tsx` | Generic welcome; hide Twenty ToS/Privacy on sign-in |
| `getTimelineActivityAuthorFullName.ts` | System events → "System", not "Twenty" |
| `DefaultWorkspaceLogo.ts`, `DefaultWorkspaceName.ts`, `title-utils.ts`, `index.html` | Generic "CRM" defaults until workspace is configured |

---

## Per-instance setup (after deploy)

1. **Settings → General → Logo** — square PNG/SVG, min 192×192. Drives sign-in, nav, tab icon, PWA, Slack previews.
2. **Settings → General → Workspace name** — tab title, invites, og:title after server inject.
3. **`.env` on instance:**
   ```env
   EMAIL_FROM_NAME="Client Name CRM"
   EMAIL_FROM_ADDRESS=notifications@clientdomain.com
   SERVER_URL=https://crm.clientdomain.com
   ```

### After logo change or image upgrade

- **Desktop:** hard refresh or clear site data if favicon stuck.
- **Mobile PWA:** remove home-screen shortcut → clear site data → re-add. PWAs cache manifest aggressively.

---

## Verify white-label (run after every image rollout)

Replace domain with the instance under test.

```bash
DOMAIN=https://crm.topoffunnel.com

# 1. Favicon redirect (must NOT be 404 when logo uploaded)
curl -sI "$DOMAIN/favicon.ico" | head -5

# 2. First HTML paint — middleware served (max-age=60), not static (max-age=0)
curl -sI "$DOMAIN/" | grep -i cache-control
curl -s "$DOMAIN/" | grep -E '<title>|apple-touch-icon|og:title'

# 3. Dynamic manifest (server-generated) — should return client name or neutral "CRM"
curl -s "$DOMAIN/manifest.json" | head -20
# expect "name": "Your Client Name" (or "CRM" when no logo uploaded)

# 4. In browser: sign-in page, nav drawer, Install app / Open in app icon
```

**Pass criteria:**

- `/favicon.ico` → **302** to files URL when workspace has logo
- `/` title matches workspace name (not bare "CRM" once logo+name set)
- `cache-control: public, max-age=60` on `/` (branding middleware)
- PWA / "Open in app" shows **client logo**, not Twenty "20"

---

## Upstream merge checklist

When merging `upstream/main` or reviewing the weekly sync PR:

1. Walk every file in the Active Core Patches table — conflicts are expected in `Logo.tsx`, `SignInUp.tsx`, `PageFavicon.tsx`, `app.module.ts`, `workspace-branding/*`.
2. Re-apply **intent**, not blind ours/theirs — upstream may refactor the same area.
3. Grep for regressions (see also tofu/BRANDING.md for the authoritative asset map):
   ```bash
   rg "android-launchericon|Welcome to Twenty|twenty\.com" packages/twenty-front/src packages/twenty-server/src --glob '!*.spec.*'
   ```
4. Run tests:
   ```bash
   npx jest packages/twenty-server/src/engine/core-modules/workspace-branding --config=packages/twenty-server/jest.config.mjs
   ```
5. Tag + publish image (see [UPSTREAM-SYNC.md](./UPSTREAM-SYNC.md)).
6. Pilot on `tofu` slug, run verify commands above, then roll fleet.

---

## Still TODO (not blocking launch)

| Item | Location | Priority |
|---|---|---|
| Email template branding | `packages/twenty-emails/src/` | Medium |
| Custom ToS/Privacy links per client | Sign-in footer | Medium |
| Replace bundled icon PNGs in `public/images/icons/` | Fork | Low (bypassed when workspace logo set). See `tofu/BRANDING.md` for the single place to manage defaults. |
