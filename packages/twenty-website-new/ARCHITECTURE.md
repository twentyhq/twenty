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
   route can't be reused on another page. Section-shaped data lives in
   `sections/<Section>/data.ts` (e.g. `sections/Plans/data.ts`), and
   cross-route domain data (e.g. the customers catalogue) lives in
   `lib/<domain>/`.
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

### Approved exceptions

`app/halftone/_lib/exporters.ts` contains two `new THREE.WebGLRenderer(...)`
calls inside template-literal strings. They are **not** runtime
instantiations in our app — they're emitted into the standalone HTML
file the user downloads from the studio, where there is no `lib/` to
import. Both lines carry an inline directive:

```ts
// boundary-allow-next-line:no-raw-webgl-renderer -- emitted into the standalone HTML export; runs in the user's downloaded file with no access to lib/visual-runtime
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
```

If the directive ever stops suppressing a real violation (the line
moves, gets deleted, or the rule changes), the boundary check fails
and the directive must be removed in the same PR.

---

## 4. The cleanup ratchet

Some rules in this document started life as **warnings** because the
codebase carried pre-existing violations that pre-dated the rules. The
ratchet plan, applied iteratively:

1. **Boundary rules start as warnings** so the rule lands without
   blocking CI on day one.
2. **`scripts/check-boundaries.mjs` ratchets via two mechanisms** — both
   guard against the list rotting out of date:
   - **Inline directives** of the form `// boundary-allow-next-line:<rule-id> -- <reason>`,
     placed on the line directly above the offending line. Use this for
     legitimate, narrow exceptions (e.g. code that only ever appears
     inside a serialized template). A directive that no longer
     suppresses a violation fails the build.
   - **`KNOWN_VIOLATIONS`** in `scripts/check-boundaries.mjs`, for
     pre-existing file-wide debt that's slated for cleanup. An entry
     that no longer matches a real violation also fails the build.
3. **Once a category is at zero**, flip the corresponding override from
   `"warn"` to `"error"` in `.oxlintrc.json` (or empty
   `KNOWN_VIOLATIONS` entirely) in the same PR.

Current state (`nx lint twenty-website-new` will tell you the true number):

| Rule                                                              | Layer / scope      | Status                       |
| ----------------------------------------------------------------- | ------------------ | ---------------------------- |
| `no-restricted-imports` — `@/app/**`                              | `sections/**`      | **error** (0)                |
| `no-restricted-imports` — `@/sections/**`                         | `lib/**`           | **error** (0)                |
| `no-restricted-imports` — `@/app/** \| @/sections/** \| @/lib/**` | `design-system/**` | **error** (0)                |
| `no-raw-webgl-renderer`                                           | repo-wide          | **error** (2 inline-allowed) |

All four layering rules are now **error**: any new violation fails CI.
If you find yourself wanting to import from a layer above you, the
answer is to lift the shared piece into `lib/` (or, for genuinely
page-shaped state like a global modal provider, mount it in
`app/layout.tsx` — see `lib/contact-cal` and `lib/partner-application`
for the pattern).

The two inline-allowed `no-raw-webgl-renderer` lines are documented in
§3 above. They're text inside the standalone HTML export pipeline, not
runtime code in our app.

---

## 5. Halftone consolidation

The shared halftone runtime lives in [`src/lib/halftone/`](./src/lib/halftone/).
Sections (`Helped`, `Testimonials`, `HomeStepper`) consume it via the
barrel `@/lib/halftone` and **must not** deep-import. The studio page
(`app/halftone/page.tsx`) and the studio-only modules under
`app/halftone/_lib/` and `app/halftone/_components/` deep-import from
`@/lib/halftone/<file>` — those imports are inside the studio route's
private folders, not section code, so they're fine.

### What's where

| Folder                                      | Contents                                                                                                                                                                                                   | Section-facing?                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `lib/halftone/halftone-canvas.tsx`          | The reusable WebGL canvas component.                                                                                                                                                                       | Yes (re-exported from the barrel). |
| `lib/halftone/state.ts`                     | `HalftoneStudioSettings`, defaults, normaliser, reducer.                                                                                                                                                   | Yes (re-exported from the barrel). |
| `lib/halftone/footprint.ts`                 | Pure scale / rect helpers + the runtime source string used by the studio's HTML export.                                                                                                                    | Yes (re-exported from the barrel). |
| `lib/halftone/geometry-registry.ts`         | Builtin geometry catalogue + GLB / FBX loader.                                                                                                                                                             | `loadImportedGeometryFromUrl` is.  |
| `lib/halftone/materials.ts`                 | Halftone shader material — only `halftone-canvas.tsx` consumes it.                                                                                                                                         | No (internal to `lib/halftone/`).  |
| `app/halftone/_lib/exporters.ts`            | React / HTML / GIF / PNG export pipeline. Lives in `app/` because it's only ever invoked from the studio page (and uses raw `THREE.WebGLRenderer` for offscreen renders — see §3 grandfathered exception). | No (studio-only).                  |
| `app/halftone/_lib/share.ts`                | URL-share encode / decode for the studio's "share preset" feature.                                                                                                                                         | No (studio-only).                  |
| `app/halftone/_lib/imageSvgExport.ts`       | SVG halftone export from a raster source.                                                                                                                                                                  | No (studio-only).                  |
| `app/halftone/_lib/exportNames.ts`          | Filename / component-name normaliser for export artefacts.                                                                                                                                                 | No (studio-only).                  |
| `app/halftone/_lib/formatters.ts`           | UI-only number / unit formatters for the controls panel.                                                                                                                                                   | No (studio-only).                  |
| `app/halftone/_lib/glassEnvironmentData.ts` | Embedded HDR data URL for the glass material in standalone HTML exports.                                                                                                                                   | No (studio-only).                  |
| `app/halftone/_components/*`                | The studio UI: `HalftoneStudio`, `ControlsPanel`, `controls/*`.                                                                                                                                            | No (studio-only).                  |

### Rules

- New section consumers import from `@/lib/halftone` (the barrel).
  Deep-importing `@/lib/halftone/<file>` works but is not part of the
  supported API; the deep modules may be reorganised.
- New studio-only modules go under `app/halftone/_lib/` /
  `_components/`. Don't promote them to `lib/halftone/` until a section
  needs them — the leak goes the other way.
- `app/halftone/_lib/exporters.ts` is the **only** approved consumer of
  raw `new THREE.WebGLRenderer(...)` (see §3) and is grandfathered in
  `KNOWN_VIOLATIONS`. If you add a second consumer, you have to either
  promote the renderer factory to handle export-resolution renders or
  add a second `KNOWN_VIOLATIONS` entry — not silently extend the rule.

---

## 6. Shared scroll & motion primitives

Scroll-driven and media-query-driven UI is concentrated in two small `lib/`
folders. **Sections may not roll their own** — every duplication of these
patterns has historically drifted (different rAF policies, missed
`{ passive: true }`, missed cleanup, missed SSR fallback).

### `lib/scroll/`

| Export                  | Shape                                                     | Use when                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `computeScrollProgress` | `(rectTop, rectHeight, viewportHeight) => number \| null` | Pure function. Returns 0..1 progress as a sticky-bearing container scrolls past the viewport, or `null` when the container is shorter than the viewport.            |
| `useScrollProgress`     | `(ref, onProgress, { enabled? }) => void`                 | A section needs the live scroll progress of a sticky container (steppers, scroll-driven scenes). Calls `onProgress` synchronously on each `scroll` / `resize`.      |
| `ScrollProgressEffect`  | `<ScrollProgressEffect ref onScrollProgress enabled? />`  | The same hook expressed as a JSX child. Use only when you need to mount the listener conditionally inside JSX (it's rare; prefer the hook + `enabled` in new code). |
| `useScheduledOnScroll`  | `(callback, { enabled?, fireImmediately? }) => void`      | Scroll-driven layout work that mutates the DOM (`getBoundingClientRect` over many nodes, recomputing a 3D scene). Coalesces calls to one per animation frame.       |

The pure `computeScrollProgress` exists so the math is testable in node
without jsdom (see `lib/scroll/__tests__/compute-scroll-progress.test.ts`).
All three hooks delegate to it for the actual progress calculation —
update the math in one place.

Why `useScheduledOnScroll` and not "just inline rAF":

- The pattern is repeated identically in two sections today
  (`ThreeCardsScrollLayoutEffect`, `HelpedSceneScrollLayoutEffect`). One
  primitive removes the drift.
- The cleanup path (cancel any pending rAF on unmount) is easy to forget
  and produces "cannot read properties of null" warnings under React
  StrictMode double-invocation.

### `lib/motion/`

| Export                            | Shape                                     | Use when                                                                                                                                                             |
| --------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useMediaQuery`                   | `(query, { serverFallback? }) => boolean` | Any client-side reaction to a CSS media query. Backed by `useSyncExternalStore`, concurrent-safe, defaults SSR to `false`.                                           |
| `usePrefersReducedMotion`         | `() => boolean`                           | Conditional non-essential animation. **Don't** use this to skip functional animation (e.g. a scroll-driven stepper still updates; only its easing transition drops). |
| `getPrefersReducedMotionSnapshot` | `() => boolean`                           | Snapshot read from non-component code or one-shot mount-time gates where toggling the preference must NOT re-init an expensive scene.                                |

`useStepperMdUp` (and its snapshot sibling `getStepperMdUpSnapshot`) and
`StepperSwipeDeck`'s reduced-motion subscription are all built on these
primitives. New code must not call `window.matchMedia(…)` directly — pick
the hook for component bodies that should track changes, or the snapshot
for utilities and one-shot mount-time gates.

#### Hook vs. snapshot — when to pick which

The two shapes exist for different problems and **are not interchangeable**:

- **Hook (`usePrefersReducedMotion`, `useMediaQuery`)** subscribes to
  changes and re-renders the consumer. Use this in component bodies that
  conditionally render different markup or transitions (e.g. `StepperSwipeDeck`'s
  CSS transition opt-out). The user toggling the OS preference live updates
  the UI without a refresh.
- **Snapshot (`getPrefersReducedMotionSnapshot`, `getStepperMdUpSnapshot`)**
  reads `matchMedia(...).matches` once. Use this from
  - non-component code (a layout utility called inside `useEffect`),
  - mount-time gates inside a `useEffect([])` whose effect body is too
    expensive to tear down and rebuild on every preference toggle (the
    Three.js mount in `PartnerHalftoneOverlay` / `StepperBackgroundHalftone`).

If you find yourself wanting "react to changes but don't re-init the scene,"
that's a third pattern (subscribe in a separate effect that mutates the
already-mounted scene). It doesn't exist yet because no consumer needs it;
add it here when one does.

---

## 7. Environment variable contract

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

## 8. Cross-browser & memory invariants

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
