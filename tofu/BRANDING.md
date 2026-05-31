# Tofu Twenty CRM — Branding & White-Labeling Guide

This document is the single source of truth for all logo / icon / branding assets in the Tofu fork.

## Goal
Make it trivial for any future fork or client deployment to replace Twenty branding with their own, with zero guesswork.

---

## 1. Per-Workspace Branding (Recommended)

When a workspace uploads a logo in **Settings → General**, the following automatically become branded:

- Browser tab favicon (`/favicon.ico` → 302s to the uploaded logo)
- HTML `<head>` title + meta tags (via server-side injection)
- PWA install banner + installed app icon (via server-side `/manifest.json`)
- In-app logo (via `Logo.tsx` component)

**No code changes needed.** This is the primary white-label mechanism.

---

## 2. Fork-Level Default Branding (When No Workspace Logo Is Uploaded)

When a workspace has **not** uploaded a logo, the app falls back to neutral assets controlled by this fork.

### Default PWA / App Icon

**Location:**
```
packages/twenty-front/public/branding/default-app-icon.svg
```

**How to replace for a new client / fork:**
1. Replace `default-app-icon.svg` with your client's icon (must be square, ideally 192×192+).
2. You may also add a PNG version (`default-app-icon.png`) if you need raster for older clients.
3. Update the following two files to point to your new asset name if you change it:

   - `packages/twenty-front/public/manifest.json`
   - `packages/twenty-server/src/engine/core-modules/workspace-branding/utils/generate-workspace-manifest.util.ts`

**Current fallback icon** is a minimal dark square with a "C" (for CRM). It is intentionally generic.

---

## 3. Complete Branding Asset Map

Search these exact strings / paths when auditing a new fork or preparing a client deployment.

### Server-Side (twenty-server)

| File | Purpose | Replace? | Notes |
|------|---------|----------|-------|
| `src/engine/core-modules/workspace-branding/workspace-branding.middleware.ts` | Intercepts `/favicon.ico`, `/manifest.json`, and root HTML | Usually no | Central control point |
| `src/engine/core-modules/workspace-branding/utils/generate-workspace-manifest.util.ts` | Builds dynamic PWA manifest | Only if changing default icon path | Contains the fallback icon URL |
| `src/engine/core-modules/workspace-branding/workspace-branding.service.ts` | Fetches workspace logo + displayName | Usually no | — |
| `src/engine/core-modules/workspace-branding/utils/inject-workspace-branding-into-index-html.util.ts` | Rewrites `<title>`, favicon links, etc. | Usually no | — |

### Frontend (twenty-front)

| File | Purpose | Replace? | Notes |
|------|---------|----------|-------|
| `public/manifest.json` | Static PWA manifest (used as ultimate fallback) | Update icon path if you rename the default | Currently points to `/branding/default-app-icon.svg` |
| `public/branding/default-app-icon.svg` | **The main default icon** | **YES** — this is the #1 file to replace | Used by both static manifest and server-generated manifest when no workspace logo |
| `public/favicon.ico` | Default favicon | Optional | Only shown if server branding middleware doesn't intercept |
| `src/modules/ui/utilities/page-favicon/components/PageFavicon.tsx` | Client-side favicon + late manifest swap | Usually no | Now mostly a safety net |
| `src/modules/auth/components/Logo.tsx` | Login page + nav logo | Usually no | Already patched to never show Twenty icon |
| `public/images/integrations/twenty-logo.svg` | Integration modal header | **Yes** if you want to remove it | Only appears in specific OAuth modals |

### Other Potential Leaks (grep these)

```bash
# Run this from the repo root when preparing a client deployment
rg "twenty|Welcome to Twenty|android-launchericon|launchericon" \
  packages/twenty-front/src \
  packages/twenty-server/src \
  --glob '!*.spec.*' \
  --glob '!*.test.*'
```

Also check:
- Email templates (`packages/twenty-emails`)
- Any hardcoded `https://twenty.com` or `app.twenty.com` strings in docs or error messages
- Docker image labels / `package.json` product name (cosmetic only)

---

## 4. PWA "Open in App" / Install Prompt Behavior

**Before v2.8.10-tofu:** The PWA prompt and installed icon often showed the old Twenty "20" because:
- `manifest.json` was fully static
- `PageFavicon.tsx` only swapped it client-side (too late for install prompt caching)

**After this change:**
- `/manifest.json` is now **always** served dynamically by the server (see `workspace-branding.middleware.ts`)
- When a workspace logo exists → manifest icons point directly to the real uploaded logo
- When no logo → manifest uses the neutral `/branding/default-app-icon.svg` you control

This fixes the "20 logo still in the install banner" issue reported by the user.

---

## 5. Quick Checklist for New Client / New Fork

1. [ ] Replace `packages/twenty-front/public/branding/default-app-icon.svg`
2. [ ] (Optional) Add `default-app-icon.png` and update references
3. [ ] Update `public/manifest.json` icon `src` if you changed the filename
4. [ ] Update the generator util if you changed the filename
5. [ ] Run the grep audit above and remove any remaining Twenty strings
6. [ ] Rebuild + deploy
7. [ ] For each workspace: upload the real logo in Settings → General (this overrides everything)

---

## 6. Future Improvements (Nice to Have)

- Add a PNG version of the default icon for maximum compatibility.
- Add a proper multi-size icon set in `public/branding/` with a manifest generator that references local files.
- Make the default icon color / letter configurable via environment variable at build time.

---

**Last updated:** May 2026 (v2.8.10-tofu white-label improvements)
**Owner:** Tofu fork maintainers
