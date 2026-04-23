# twenty-website

The marketing site at `twenty.com`. Independent from `twenty-front` /
`twenty-server` (the product). Next.js App Router + React 19 + Linaria.

## Getting started

```bash
yarn install
yarn nx run twenty-website:dev
```

Production build / type-check:

```bash
yarn nx run twenty-website:build
```

## Folder map

```
src/
  app/                       # Next.js App Router routes
    (home)/                  # Route group: home page
    (blog)/blog/             # Route group: blog (stub, opt out of indexing)
    customers/               # Customer case studies
    enterprise/              # Enterprise activation flow
    halftone/                # Halftone studio (interactive tool)
    partners/                # Partner program
    pricing/                 # Pricing page
    privacy-policy/          # Legal
    product/                 # Product overview
    releases/                # Release notes
    terms/                   # Legal
    why-twenty/              # Positioning page
    api/                     # API routes (enterprise + partners)
    layout.tsx               # Root layout, default metadata
    sitemap.ts               # Sitemap generation
    robots.ts                # Robots.txt generation

  components/                # Cross-cutting UI used by layout or 3+ pages
    contact-cal-modal/       # "Talk to us" modal + button
    stepper/                 # Mobile stepper swipe deck (3 sections)
    FooterVisibilityGate.tsx # Hides footer on /halftone

  content/                   # Site content (data, not code)
    blog/                    # MDX blog posts (see content/blog/README.md)
    releases/                # MDX release notes
    site/                    # Site-wide constants (asset paths, etc.)

  design-system/             # Linaria primitives (Heading, Body, Button, Stack…)
  illustrations/             # Heavy WebGL/3D visuals + IllustrationMount registry
  sections/                  # Page sections (Hero, Faq, Pricing, …)
  icons/                     # SVG icon components
  theme/                     # Linaria theme (colors, spacing, typography)

  lib/                       # Pure utilities (no UI). Cohesive subdomains:
    blog/                    # Blog frontmatter schema + loader (Zod)
    community/               # GitHub stars, Discord member count
    partner-application/     # Partner form helpers
    releases/                # Release notes loaders + GitHub release tag
    semver/                  # Semver comparison
    seo/                     # getSiteUrl + buildPageMetadata
    visual-runtime/          # WebGL safety policy + WebGlMount + renderer factory
```

## Architectural rules (the short version)

1. **Server Components by default.** `'use client'` only when the file actually
   needs hooks, browser APIs, or third-party client widgets.
2. **Linaria only.** `styled` from `@linaria/react`, or the `css` tag from
   `@linaria/core`. No `.css` / `.scss` files for component styling.
3. **Fail fast on missing config.** Don't `?? ''` to hide missing env vars or
   missing required content fields. Validate at boundaries (Zod) and let the
   build break if something architecturally required is missing.
4. **No `as` casts to silence the type checker.** Use discriminated unions,
   exhaustive switches, and Zod parsing.
5. **Heavy visuals go through `WebGlMount`.** See
   [`src/lib/visual-runtime/`](src/lib/visual-runtime/) for the policy. New
   WebGL renderers must use `createSiteWebGlRenderer` — never
   `new THREE.WebGLRenderer()` directly. Each scene is co-located with its
   owning section under `src/sections/<Section>/visuals/`.
6. **Page data is co-located.** Per-route content lives next to the page as
   `<route>/<section>.data.ts`. Truly cross-page data (menu, footer, faq,
   trusted-by) lives at `src/sections/<Section>/data.ts`. There are no
   `_constants/` folders.

## Operational switches

The site reads three site-wide environment variables — see
[`.env.example`](.env.example) for the canonical list:

- `NEXT_PUBLIC_WEBSITE_URL` — canonical origin used by `metadataBase`,
  sitemap, robots, and absolute OG/Twitter URLs.
- `NEXT_PUBLIC_DISABLE_HEAVY_VISUALS` — hard kill switch that statically
  replaces every WebGL/3D illustration with its fallback. Use during a
  driver-related incident.
- `NEXT_PUBLIC_MAX_WEBGL_CONTEXTS` — soft cap on concurrent WebGL contexts.
  Defaults to 8.

## Cross-browser & memory notes

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
  illustrations. The root layout `preconnect`s to that origin so the first
  3D model on the page loads without a TLS handshake stall.
