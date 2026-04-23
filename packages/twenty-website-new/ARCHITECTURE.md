# Architecture

Authoritative reference for the layering, dependency, and visuals contracts in
this package. Every rule here is enforced by lint, by `scripts/check-boundaries.mjs`,
or — when neither is possible — by code review against this document.

If you're adding a new section, read [`SECTIONS.md`](./SECTIONS.md) instead.
If you just want to run the site, read [`README.md`](./README.md).

---

## 1. Layering rules

The source tree is composed of six layers. Each layer may only depend on
layers that come **after** it in the list below.

| #   | Layer                  | May import from                                                             | Purpose                                                                                                       |
| --- | ---------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | `src/app/**`           | `sections`, `lib`, `design-system`, `icons`, `theme`, `content`             | Next.js App Router routes, route-level layouts, route-scoped data files, route-scoped private folders (`_*`). |
| 2   | `src/sections/**`      | `lib`, `design-system`, `icons`, `theme`                                    | Page sections (Hero, Faq, Pricing, …). Page-agnostic, composable in any order. May own heavy visuals.         |
| 3   | `src/lib/**`           | `design-system` (only when used as a leaf hook/component), `icons`, `theme` | Pure utilities and runtime services (semver, seo, visual-runtime, contact-cal, …). No knowledge of routes.    |
| 4   | `src/design-system/**` | `icons`, `theme`                                                            | Linaria primitives (Heading, Body, Button, Stack, …). Theme-driven. No business logic.                        |
| 5   | `src/icons/**`         | `theme`                                                                     | SVG icon components.                                                                                          |
| 6   | `src/theme/**`         | (nothing internal)                                                          | Tokens, typography, spacing, colors, CSS variables.                                                           |

`src/content/**` is the seventh layer (data, not code) and may be read by any
layer.

### Why a hard boundary

These rules are **not** stylistic. Each one cuts a real risk:

1. **`sections → app` is forbidden.** A section that knows about a specific
   route can't be reused on another page. The `Plans` section currently imports
   `PLANS_DATA` from `app/pricing/plans.data.ts` — it is grandfathered (see
   §4 below) but the long-term answer is that pricing data lives in
   `sections/Plans/data.ts` (or is passed in as a prop).
2. **`lib → sections | app` is forbidden.** `lib` is the only layer the
   server-side data fetchers and pure utilities live in. If `lib` imports from
   `sections/`, you've created a code cycle that breaks tree-shaking and
   confuses the build graph. If `lib` imports from `app/`, you've coupled a
   reusable utility to a specific URL.
3. **`design-system → anything-but-theme/icons` is forbidden.** The design
   system is the boundary between "raw markup + tokens" and "product code." If
   a primitive imports from `lib/` or `sections/`, it's no longer a primitive.

### Mechanical enforcement

- **Layering rules** → `no-restricted-imports` overrides in
  [`.oxlintrc.json`](./.oxlintrc.json). Currently emitted as **warnings** — see
  §4 for the cleanup plan that flips them to errors.
- **Heavy visuals contract** (no raw `new THREE.WebGLRenderer`) →
  [`scripts/check-boundaries.mjs`](./scripts/check-boundaries.mjs). Hard-fails
  the build except for an explicit `KNOWN_VIOLATIONS` allowlist. Wired into
  the `lint` Nx target via `dependsOn: ["check-boundaries"]`.

---

## 2. Server vs. client components

- **Server Components by default.** Adding `'use client'` is a load-cost
  decision: the file (and everything it transitively imports) ships to the
  browser. Default to RSC. Add `'use client'` only when:
  - You use a React hook (`useState`, `useEffect`, `useReducer`, etc.).
  - You need a browser API that doesn't exist on the server (`window`,
    `IntersectionObserver`, …).
  - You render a third-party widget that requires client mounting (`@calcom/embed-react`,
    Lottie, anything that touches WebGL on mount).
- **Co-locate the boundary at the smallest unit that needs it.** Don't add
  `'use client'` to a page just because one card needs interactivity — extract
  the card into its own client component and import it from the server page.
- **Server-only data fetchers live in `lib/<domain>/`.** They are imported
  directly by route files. Examples: `lib/community/fetch-community-stats.ts`,
  `lib/releases/fetch-latest-release-tag.ts`. They use Next's request-scoped
  `cache()` for de-duplication.

---

## 3. Heavy visuals (WebGL / 3D / Lottie)

The site renders many WebGL scenes simultaneously. Each scene consumes a
GPU context, and most browsers cap the number of live contexts (~16 on
Chrome / ~8 on Safari) — exceed the cap and the oldest scene is silently
recycled, producing blank canvases mid-page.

The contract that prevents this:

1. **Every `<canvas>` mounts via `WebGlMount`** from
   `lib/visual-runtime/webgl-mount.tsx`. The mount:
   - Coordinates with `useWebGlPolicy` to enforce the soft cap on concurrent
     contexts (`NEXT_PUBLIC_MAX_WEBGL_CONTEXTS`, default 8).
   - Honours the global kill switch
     (`NEXT_PUBLIC_DISABLE_HEAVY_VISUALS=true`) by mounting the fallback
     instead of the renderer.
   - Wraps the mounted scene in `WebGlErrorBoundary` so a single failed
     shader cannot crash the page.
2. **Renderers come from `createSiteWebGlRenderer`** from
   `lib/visual-runtime/create-site-webgl-renderer.ts`. The factory centralises
   `powerPreference`, `alpha`, `antialias`, and the kill-switch interaction.
   Calling `new THREE.WebGLRenderer(...)` directly is a hard build error —
   enforced by `scripts/check-boundaries.mjs`.
3. **Visuals are co-located with their owning section.** A scene that lives
   in `sections/Hero/visuals/HeroProduct/` is owned by `Hero`. There is no
   global `illustrations/` folder. (The README used to claim there was; it's
   now corrected.)
4. **DRACO comes from one place.** `lib/visual-runtime/draco-decoder-path.ts`
   is the single source for the decoder URL. The root layout `preconnect`s to
   that origin so the first GLB on the page doesn't pay a TLS handshake.

### Grandfathered exception

`app/halftone/_lib/exporters.ts` calls `new THREE.WebGLRenderer` directly
because the export pipeline renders at custom resolutions outside the
site-wide context budget. It is listed in `KNOWN_VIOLATIONS` of
`scripts/check-boundaries.mjs` and will be reconciled when the halftone
studio is consolidated (see §5).

---

## 4. The cleanup ratchet

Several rules in this document are emitted as **warnings** today because the
codebase carries pre-existing violations that pre-date the rules. The plan:

1. **Boundary warnings stay warnings** until each cleanup PR drops the
   warning count for that layer to zero.
2. **`scripts/check-boundaries.mjs` ratchets via `KNOWN_VIOLATIONS`.** Each
   entry must reference a real, current violation; an entry that no longer
   matches a real file is itself a build failure (so the list cannot rot).
3. **Once a category is at zero**, flip the corresponding override from
   `"warn"` to `"error"` in `.oxlintrc.json` (or remove the
   `KNOWN_VIOLATIONS` entry entirely) in the same PR.

Current grandfathered counts (`nx lint twenty-website-new` will tell you the
true number):

| Rule                                      | Layer / scope                    | Current count |
| ----------------------------------------- | -------------------------------- | ------------- |
| `no-restricted-imports` — `@/app/**`      | `sections/**`                    | ~50 warnings  |
| `no-restricted-imports` — `@/sections/**` | `lib/**`                         | 1 warning     |
| `no-raw-webgl-renderer`                   | `app/halftone/_lib/exporters.ts` | 1 (allowlist) |

The known specific offenders are documented inline in `KNOWN_VIOLATIONS`
(for the boundary script) and discoverable from the oxlint output (for the
import rules).

---

## 5. Halftone consolidation

The halftone studio (`app/halftone/`) is currently the largest source of
boundary violations because three sections (`Helped`, `Testimonials`, and
`HomeStepper`) reach into `app/halftone/_components/` and
`app/halftone/_lib/` for shared canvas + state primitives.

The "_" prefix is Next's convention for route-private folders, which makes
the dependency direction (`sections → app/halftone/_\*`) doubly wrong: it's
both a layering violation _and_ a violation of Next's own private-folder
contract.

The plan, ordered to avoid rework:

1. Move `_lib/state.ts`, `_lib/footprint.ts`, `_lib/geometry-registry.ts`
   into `lib/halftone/`.
2. Move `_components/HalftoneCanvas.tsx` into `lib/halftone/` (or
   `sections/Halftone/components/Canvas.tsx` if it grows section-shaped).
3. Update the halftone studio page (`app/halftone/page.tsx`) to import from
   the new location.
4. Update the three offending sections.
5. Delete the boundary warnings + the grandfathered entry.

This is tracked outside this PR (see Phase 5 of the rollout plan).

---

## 6. Environment variable contract

The site reads exactly three site-wide env vars. They are documented in
[`.env.example`](./.env.example) and validated at the boundary that consumes
them (no `?? ''` to silently mask a missing value).

| Variable                            | Required | Default | Purpose                                                                                                                  |
| ----------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_WEBSITE_URL`           | yes      | —       | Canonical origin used by `metadataBase`, sitemap, robots, and absolute OG / Twitter URLs. Read by `lib/seo/site-url.ts`. |
| `NEXT_PUBLIC_DISABLE_HEAVY_VISUALS` | no       | `false` | Statically replaces every WebGL / 3D illustration with its fallback. Use during a driver-related incident.               |
| `NEXT_PUBLIC_MAX_WEBGL_CONTEXTS`    | no       | `8`     | Soft cap on concurrent WebGL contexts before `WebGlMount` declines new ones.                                             |

API routes under `app/api/` also consume server-only env vars (Stripe keys,
GitHub tokens, JWT secrets). Those are documented at the consuming module.

---

## 7. Cross-browser & memory invariants

Some implementation details that have caused real bugs and must not regress.

- **`100vh` vs `100dvh`.** Sticky scroll containers use `100vh` on purpose
  (it equals the large viewport, so the sticky height does not jitter as
  mobile Safari's URL bar collapses). Full-screen overlays / drawers / the
  body's `min-height` use both: `100vh` first as a fallback, then `100dvh`
  for the actual visible viewport. Don't replace one for the other without
  thinking about which behaviour you want.
- **`backdrop-filter` always pairs with `-webkit-backdrop-filter`.** Linaria
  doesn't auto-prefix and Safari < 18 silently no-ops the unprefixed form.
- **Big assets stay in `public/`, not in JS strings.** Inlining a base64
  data URL forces V8 to parse and intern it on every page load and prevents
  browser caching. The shared glass environment HDR lives at
  `/illustrations/common/glass-environment.jpg`.
- **One DRACO origin.** `lib/visual-runtime/draco-decoder-path.ts` is the
  single source of truth — bump the version there once instead of in twelve
  illustrations.
