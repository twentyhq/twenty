# `twenty-website-new` — Remaining Architecture Work

This file used to be the original full audit. As phases land, completed
items get removed. What remains is the prioritized backlog, with
execution-ready instructions for each step.

The order is dependency-aware: each phase either builds on a primitive
introduced earlier or unlocks one that the next phase needs. Skipping
ahead causes rework.

For the philosophy and contracts these phases enforce, see
[`ARCHITECTURE.md`](./ARCHITECTURE.md). For section conventions, see
[`SECTIONS.md`](./SECTIONS.md).

---

## Already done (for reference, not action)

Phases 0 through 9 landed the architectural plumbing and closed the
non-enterprise correctness backlog:

- **Phase 0** — Boundary script + cleanup ratchet, oxlint layering rules,
  fail-closed releases gate, blog removed from sitemap + robots, deleted
  orphan `*.data.ts` files, README + project name fixes,
  `Pages.Product` signoff fix, `Pages.Product` in signoff wiring.
- **Phase 1** — `lib/scroll/` + `lib/motion/` primitives. Three duplicate
  `SyncScrollProgressFromContainerEffect` files collapsed into one
  `ScrollProgressEffect`.
- **Phase 2** — Section-level `matchMedia` / scroll callers migrated to
  the new primitives (with snapshot helpers for one-shot mount-time
  gates).
- **Phase 3** — Halftone consolidation: `lib/halftone/` barrel, sections
  consume only the public API.
- **Phase 4** — Route-scoped data and types lifted out of `app/`:
  `lib/customers/`, `lib/partner-application/`, `sections/Plans/data.ts`.
  Layering rules `sections → app` and `lib → sections` flipped from warn
  to **error**. Global modal provider (`PartnerApplicationModalRoot`)
  mounted in `app/layout.tsx`.
- **Phase 5** — `boundary-allow-next-line` directive support in
  `scripts/check-boundaries.mjs`. The two `new THREE.WebGLRenderer`
  lines in `app/halftone/_lib/exporters.ts` carry inline directives;
  `KNOWN_VIOLATIONS` is now empty.
- **Phase 6** — `design-system → above` rule flipped from warn to
  **error**. All four layering rules are now error.
- **Phase 7** — `lib/api/` primitives (`fetchWithTimeout`,
  `readJsonBody`, `createRateLimiter`) wired into
  `/api/partner-application` with full integration test coverage.
- **Phase 8** — `prefers-reduced-motion` honoured across the remaining
  decorative animations (DraggableTerminal grow, ConversationPanel
  smooth scroll, FastPath confetti, LiveData chip pop & row enter,
  FamiliarInterface board / cursor transitions). `Helped/Card` declares
  a static logo `WebGlMount` fallback so context-budget paths degrade
  with stable layout. `Testimonials/Hourglass` migrated to
  `lib/halftone`'s shared geometry loader; `HourglassCanvas` documented
  as an intentionally-bespoke shader rather than accidental drift.
  Halftone studio bundle reach audited — no leakage into marketing
  sections.
- **Phase 9** — Correctness & data-integrity bugs closed:
  partner-application schema and webhook payload extended to forward
  every field the form collects (with body cap raised to 16 KB and
  matching test coverage). `compareSemanticVersions` rewritten to the
  SemVer 2.0.0 algorithm with full pre-release / build-metadata
  precedence and 11 dedicated tests. `buildPageMetadata` now deep-merges
  `openGraph` / `twitter` / `alternates`, with a documented merge
  contract, full unit-test coverage, and adoption rolled out to every
  static-metadata page (product, pricing, partners, why-twenty,
  customers + 6 case-study pages, terms, privacy, halftone, releases,
  enterprise/activate). GitHub + Discord community-stats fetchers wrapped
  in `unstable_cache(revalidate: 3600)` and `GITHUB_TOKEN` documented in
  `ARCHITECTURE.md` §9 + `.env.example`.
- **Phase 10** — Design-system layer grown to cover the patterns
  re-implemented across consumers. `Modal` primitive built on Base UI's
  `Dialog` (free focus trap, scroll lock, ESC, click-outside, ARIA,
  focus restoration); `ContactCalModal` and `PartnerApplicationModal`
  migrated, deleting all bespoke focus / scroll-lock / portal code.
  `Form` compound (`Field`, `Input`, `Textarea`) provides accessibility
  context for `id` / `aria-describedby` / `aria-invalid` wiring;
  partner application migrated. `Stack` / `Inline` / `Grid` layout
  primitives added at `Layout/`. `theme.layout` width tokens
  (`readingNarrow` / `readingWide` / `editorial`) added and adopted by
  `LegalDocument`, `ReleaseNotes`, `Signoff/Heading`,
  `ThreeCards/Intro`, and the home page editorial heading.
  `ARCHITECTURE.md` §7 documents the design-system layer; barrel
  re-exports updated.
- **Phase 11** — Section contract codified and enforced. `Marquee.Root`
  converted from prop to slot (`<Marquee.Heading segments={...} />`);
  `TrustedBy.Root` migrated from `Children.toArray()` positional
  indexing to `displayName`-matched named slots (`Separator`, `Logos`,
  `ClientCount`). Section-root `*Shape.tsx` files (Helped, Signoff,
  Testimonials, Footer) moved under `components/`. `Hero` barrel split
  to `components/index.ts` + extracted `ProductVisual.tsx` /
  `ReleaseNotesVisual.tsx`. `LegalDocument` reshaped into the standard
  section layout (`components/LegalDocumentPage.tsx` + barrel; consumers
  now render `<LegalDocument.Page>`). `Helped/types/index.ts` barrel
  added to match every other typed section. Contract codified in
  `scripts/check-section-shape.mjs` (barrel presence, Root presence,
  no-`Children.toArray`, displayName on every Root-discovered slot)
  with `LEAF_SECTIONS` allowlist for `CaseStudy`, `CaseStudyCatalog`,
  `LegalDocument`. Wired into the `lint` Nx target alongside
  `check-boundaries`. `ARCHITECTURE.md` §8 documents the contract.
- **Phase 12** — HTTP security headers + tooling polish.
  `next.config.ts` ships HSTS (2y, subdomains, preload-eligible),
  `X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, `Permissions-Policy` denying
  camera / microphone / geolocation / payment, `X-Frame-Options: DENY`
  and CSP `frame-ancestors 'none'` on every route (full
  `script-src`/`style-src` CSP deferred — tracked as a separate
  follow-up that needs per-vendor nonce/hash work for Cal.com,
  Stripe, and Lottie). `sharp` moved to `dependencies` so prod
  installs running `--omit=dev` get the fast image-optimisation path.
  `tsconfig.json` documented inline as intentionally standalone (the
  monorepo's `tsconfig.base.json` would force overriding nearly every
  field). `BodyContainer` in `Hero/components/Body.tsx` renamed to
  `StyledBody` for consistency. `STRAIGHT_V_AT_FORTY` dead constant
  removed from `ButtonShape.tsx`. Unbounded module-level
  `failedAvatarUrls` / `failedFaviconUrls` caches replaced with the
  new `createBoundedFailureCache(256)` primitive
  (`lib/visual-runtime/bounded-failure-cache.ts`, FIFO eviction, full
  unit-test coverage) across all four consumers. `nx lint` already
  invokes `prettier . --check` via the monorepo `targetDefaults`, so
  formatting is enforced locally — wiring a dedicated CI workflow for
  this package is deferred to a separate PR (see `ARCHITECTURE.md`
  §14). `ARCHITECTURE.md` gains §12 (security headers), §13
  (standalone tsconfig), §14 (CI surface — currently documenting the
  follow-up).
- **Phase 13 (partial)** — Performance polish: drag/resize hot path
  - Lottie frame-map guard. `DraggableTerminal` and
    `DraggableAppWindow` no longer re-render on every `pointermove` —
    the hot path mutates `shellRef.current.style.transform` (and
    `width` / `height` for resize) directly, mirrors the live values
    into refs, and commits React state once on `pointerup`. The
    inline `style` falls back to the live ref while interacting so an
    unrelated re-render mid-drag (e.g. `useWindowOrder` bumping
    `zIndex`) can't snap the window back; transforms now use
    `translate3d(...)` for GPU promotion. Both windows already drop
    `transform` / `width` / `height` from their CSS `transition` list
    during interaction, so per-frame DOM writes paint cleanly. The
    contract is codified as `ARCHITECTURE.md` §15. The home-stepper
    scroll → Lottie frame map gains a paired pin: a runtime
    `console.error` in `StepperLottie` if `player.totalFrames` drifts
    from `HOME_STEPPER_LOTTIE_EXPECTED_TOTAL_FRAMES`, and a build-time
    `scripts/check-lottie-frames.mjs` that opens the `.lottie` zip,
    reads `op - ip` from `animations/main.json`, and fails `nx lint`
    on mismatch. Wired via the new `check-lottie-frames` Nx target;
    `ARCHITECTURE.md` §11 grows the corresponding bullet. **13.3
    (selective memoization) is deferred** — the spec's precondition
    is "profile, then memoize exactly what the profiler proves" and a
    meaningful profile requires a real browser session under scroll
    with React DevTools "Highlight updates"; without it, any
    `React.memo` / `useMemo` additions would be speculative and
    forbidden by the spec. Tracked below as Phase 13.3 follow-up.

---

## Phase 13.3 — Selective memoization (follow-up, requires browser profiling)

`React.memo` / `useMemo` are absent from `sections/`. Whether that's a
problem requires actual measurement, not eyeballing the code. The
spec is explicit: don't memoize speculatively.

The candidate sections — those that re-render on scroll progress and
own heavy children — are:

- `Hero/HomeVisual` (the Twenty app + terminal scene)
- `ThreeCards/components/FeatureCard/FamiliarInterfaceVisual`
- `Helped/components/Card`
- `HomeStepper` (Lottie + step UI driven by scroll)

### Procedure

1. `npx nx dev twenty-website-new`, open the home page in Chrome.
2. Open React DevTools Profiler, enable "Highlight updates when
   components render."
3. Slowly scroll the home page through each candidate section's
   range while recording.
4. For each section: list components rendering > 30/sec under scroll
   and check whether their parent's prop changes are intrinsic
   (genuine state) or incidental (a new array/object literal each
   render).
5. Memoize **only** components with stable-prop boundaries — wrap
   the offending parent's literal props in `useMemo`, then
   `React.memo` the leaf. A `React.memo` below an unstable prop is
   dead weight; verify with the profiler that the highlight count
   actually drops.

Document findings inline next to each `React.memo` call (one-liner
naming the parent prop you stabilised). Open a follow-up PR per
section so each change is reviewable independently.

---

## Phase 14 — Strategic / large-scope items

These are bigger product/architecture decisions, not mechanical work.
They're listed last because each one is a multi-PR effort with
dependencies on Phase 10–11 being done.

### 14.1 Decompose the giant visual files

- `HomeVisual.tsx` (~2700 lines): contains its own table chrome,
  sidebar, navbar, viewbar. `TablePage`, `KanbanPage`, `WorkflowPage`,
  `SalesDashboardPage` re-declare the same color maps,
  `HEADER_ICON_MAP`, grip viewport, and cell components.
- `FamiliarInterfaceVisual.tsx` (~1700), `FastPathVisual.tsx`,
  `LiveDataVisual.tsx` (~1000 each): each re-declares its own
  `APP_FONT`, `COLORS`, `SCENE_*`, styled primitives, and
  `HalftoneImageBackdrop` wiring.

Approach:

1. Extract `src/sections/HomeVisual/page-frame/` containing the
   sidebar + breadcrumbs + viewbar shell. Each `*Page.tsx` becomes
   the body slot.
2. Extract `src/sections/ThreeCards/three-cards/` (`tokens.ts`,
   `SceneFrame.tsx`, `HandCursor.tsx`, `PointerMarkers.tsx`,
   `FeatureCardWebGlBackdrop.tsx`) and migrate the three Visuals to
   use them.
3. Land in three PRs minimum (one per ThreeCards visual) so review is
   tractable.

### 14.2 Customer pages: single source of truth

Each customer in `src/app/customers/<slug>/page.tsx` is a hand-rolled
JSX file, paralleled by entries in
`src/lib/customers/case-study-catalog.ts`. Two sources of truth for the
same case study.

1. Decide the canonical form: typed catalog entries (probably MDX with
   frontmatter for the long-form text plus the existing typed metadata
   in `case-study-catalog.ts`).
2. Generate the per-customer route from a single `[slug]/page.tsx` that
   reads the catalog. Allow per-customer overrides for hero visuals
   only (which already live under `sections/CaseStudy/visuals/`).
3. Migrate the seven existing customer pages, then delete them.

### 14.3 Legal pages → MDX

`src/app/privacy-policy/_components/PrivacyPolicyDocument.tsx` and
`src/app/terms/_components/TermsDocument.tsx` are React/JSX. Legal
updates require an engineer + a deploy.

1. Convert to MDX, consumed by
   `LegalDocument/legal-document-page.tsx` (which already supports the
   shape).
2. Move the MDX files under `src/content/legal/`. This unblocks
   non-engineer edits via a PR-only workflow (no code changes).

### 14.4 Marketing copy — adopt Lingui (org standard)

**Status: decision made (i18n is a product requirement). Migration
plan drafted, awaiting sign-off on the plan.** See
[`DECISIONS/14-4-marketing-copy-strategy.md`](./DECISIONS/14-4-marketing-copy-strategy.md)
for the full survey, the rationale, and the four-phase plan.

**Decision: adopt Lingui in `twenty-website-new`,** matching the
rest of the monorepo (`twenty-front`, `twenty-server`,
`twenty-emails` already run Lingui on a shared Crowdin project
with ~30 translated locales). Marketing copy moves from inline
strings and `*.data.ts` modules into Lingui's `t` macro / `<Trans>`
component, backed by PO catalogs that flow through the existing
Crowdin pipeline.

The SSR-friendly bootstrap pattern is **`twenty-emails`'s
per-render `setupI18n` instance** (not `twenty-front`'s singleton),
because RSC has no per-request singleton model.

Migration phases (full detail in the decision doc):

1. **Foundation** (~1 week, single PR, **the go/no-go**) — deps,
   `lingui.config.ts`, SWC plugin, `app/[locale]/` segment,
   middleware, `<I18nProvider>` mount, smoke test that Lingui SWC
   plugin + Next.js 16 + React Compiler coexist.
2. **String migration** (~2 weeks, in waves, 1 PR per route) —
   shared CTAs first, then home, pricing, product, partners,
   why-twenty, releases, customers (coordinated with 14.2),
   enterprise.
3. **Crowdin / CI integration** (~1 day, config-only) — extend
   `i18n-push.yaml` / `i18n-pull.yaml` with the new package; the
   existing `**/en.po` glob in `crowdin-app.yml` already picks
   it up.
4. **SEO / switcher / MDX / Intl polish** (~3 days) — `hreflang`,
   footer locale switcher, per-locale MDX folders, drop hardcoded
   `'en-US'` in `Intl.*` calls, pass locale to Cal.com / Stripe.

**Until Phase 1 lands cleanly, Phases 14.1 / 14.2 / 14.3 should
not start extracting copy** — the target shape (Lingui macros +
per-locale MDX) isn't real until the toolchain is proven on the
foundation PR.

---

## Phase 15 — Enterprise / billing hardening (separate PR)

Explicitly deferred per earlier direction. Listed for completeness.
None of these block any other phase.

### 15.1 Open redirect on `/api/enterprise/checkout`

`src/app/api/enterprise/checkout/route.ts:16-20` accepts `body.successUrl`
and forwards to Stripe with no allowlist. Same pattern at
`src/app/api/enterprise/portal/route.ts:49-51` (`returnUrl`).

Fix: drop the field and derive from `NEXT_PUBLIC_WEBSITE_URL`, **or**
accept only a relative path and resolve via
`new URL(path, siteUrl).toString()` after asserting the resolved origin
matches `NEXT_PUBLIC_WEBSITE_URL`.

### 15.2 JWT is an indefinite bearer

`src/lib/enterprise/enterprise-jwt.ts:140-178` issues RS256 with `iat`
only — no `exp`, `aud`, `iss`, no rotation. A leaked key is good
forever. Hand-rolled RS256 is also a footgun (signature/algorithm
confusion).

Fix: replace the implementation with `jose`. Issue tokens with
`exp` (e.g. 30 days), `aud` (your domain), `iss` (your domain). Verify
with `algorithms: ['RS256']` so `alg` is pinned before verify. Add
refresh through `/api/enterprise/validate`. Consider moving entirely to
short-lived tokens signed off live Stripe state.

### 15.3 Stripe seats updates not idempotent + apiVersion not pinned

`src/app/api/enterprise/seats/route.ts:68-76` calls
`subscriptions.update` with no `idempotencyKey`. A double-submit causes
double proration. `src/lib/enterprise/stripe-client.ts:13` doesn't pin
`apiVersion`.

Fix:

1. Pass `idempotencyKey` derived from
   `(subscriptionId, seatCount, time-window)` on every Stripe write.
2. Pin `apiVersion` in `stripe-client.ts` (use the version current at
   PR time, document the bump cadence in a comment).
3. Same idempotency treatment on checkout creation.

### 15.4 Apply `lib/api/` primitives to enterprise routes

The Phase 7 primitives (`fetchWithTimeout`, `readJsonBody`,
`createRateLimiter`) should run on every public POST under
`app/api/enterprise/`. Mirror the pattern in
`/api/partner-application/route.ts`. Pick per-route caps and
rate-limits; document at the call site.

### 15.5 Webhook reconciliation

Entitlement is computed today from JWT + live Stripe `retrieve` calls.
If billing decisions ever depend on this site, add a
`customer.subscription.{updated,deleted}` webhook handler (under
`app/api/enterprise/stripe-webhook/`) that updates a server-side store.
Out of scope until billing decisions actually live here.

### 15.6 Consistent error envelope in `app/api/enterprise/*`

Today `activate/route.ts:77-83` returns raw `error.message`; others
return generic strings. Pick one envelope (`{ code: string, message: string }`),
apply uniformly, stop leaking exception text. Worth doing as part of
§15.4 since you're already touching every route.

---

## How to use this document

1. Each phase is independent of the _next_ phase only when its header
   says so. The order otherwise minimises rework.
2. When a phase lands, **delete it from this file in the same PR**.
   The doc is a backlog, not a journal — keep it short.
3. When you discover something new mid-phase that wasn't in the
   original audit, add it to the lowest-numbered phase that doesn't
   block on something else.
4. Phase 15 (Enterprise) is the only deferred-by-policy phase. The
   rest are sequenced by dependency, not priority — feel free to take
   them in order or pick one phase per available PR slot.
