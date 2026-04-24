# 14.4 — Marketing copy strategy: adopt Lingui

**Status:** Decision made (i18n is a product requirement). Migration
plan below, awaiting sign-off on the plan.
**Decides:** How marketing copy is authored, stored, translated, and
edited in `twenty-website-new` from now on.
**Blocks:** Phase 14.1 (decompose visuals) and Phase 14.2 (customer
pages → MDX + catalog) — both extract copy and need the target
shape (Lingui macros + per-locale MDX) settled first.
**Decider:** Repo owner. Foundation phase below is the go/no-go.

---

## Decision

**Adopt Lingui in `twenty-website-new`, matching the rest of the
monorepo.** Marketing copy moves from inline strings and `*.data.ts`
modules into Lingui's `t` macro / `<Trans>` component, backed by PO
catalogs that flow through the existing Crowdin pipeline.

The rationale is the user requirement: **the product is global, so
i18n is a real requirement, not a someday-maybe.** That collapses
the option space:

- A "consolidated TypeScript modules, English-only" approach was
  considered and rejected because it does not deliver i18n. It would
  fix the duplication bug but force a second migration the moment a
  non-English locale ships.
- `next-intl` was considered and rejected because the org already
  runs Lingui (twenty-front, twenty-server, twenty-emails) on a
  shared Crowdin project with a finished CI pipeline and ~30
  translated locales. Picking a second i18n stack would split the
  translator workflow, the glossary, the QA loop, and the CI
  surface for no engineering or product win.
- A headless CMS was considered and rejected because CMS i18n is
  not Lingui-native; adopting one would fragment the translation
  pipeline. CMS remains a future option for marketing edit
  velocity (separate decision; Phase 15+).

---

## Context

The package today has roughly **3,500 LOC** of named marketing copy,
spread across **28 `*.data.ts` files** under `src/app/<route>/` and
**5 `<Section>/data.ts` files** under `src/sections/`. On top of
that there's:

- **~995 LOC of inline case-study copy** (six `src/app/customers/<slug>/page.tsx`
  files each holding a `CASE_STUDY` literal, ~141–181 LOC apiece).
- **~1,329 LOC of inline legal prose** (`TermsDocument.tsx` ~515,
  `PrivacyPolicyDocument.tsx` ~814 — both pure JSX).
- **Repeated CTA strings** ("Get started", "Talk to us") inlined in
  ~10 `page.tsx` and component files.
- **Repeated taglines** ("#1 open source CRM" and close variants) in
  ~7 places — the home page, four route metadatas, partners cards,
  and the FAQ.

Single-consumer property: every route's `*.data.ts` is imported by
exactly one `page.tsx`. The drift is **not** between data files; it's
between data files and the inline strings that bypass them.

Current i18n posture is "English only and not load-bearing":

- `<html lang="en">` set in `src/app/layout.tsx` (today).
- No `app/[locale]/` routing, no i18n library in `package.json`.
- 5 hardcoded `'en-US'` / `'en'` calls into `Intl.DateTimeFormat` /
  `Intl.NumberFormat`.

Existing org-wide i18n machinery (this is what makes the marginal
cost of adoption low):

- `twenty-shared/translations` exports `APP_LOCALES` (30 locales:
  `en`, `pseudo-en`, plus 28 production locales) and `SOURCE_LOCALE`.
  Every other package consumes these constants. The marketing site
  will too — no new locale list, no fork.
- `twenty-front`, `twenty-server`, `twenty-emails` each define
  `lingui.config.ts` with `formatter({ lineNumbers: false,
printLinguiId: true })`, `compileNamespace: 'ts'`, and a
  `catalogs[].path = '<rootDir>/src/locales/{locale}'` shape. The
  marketing site copies this verbatim.
- `.github/crowdin-app.yml` already globs `**/en.po`, so a new
  package adding `src/locales/en.po` is automatically picked up by
  the existing Crowdin sync. No Crowdin config change required.
- `.github/workflows/i18n-push.yaml` and `i18n-pull.yaml` already
  run `nx run <package>:lingui:extract` and `lingui:compile` for
  the three current packages. Adding a fourth line is the entirety
  of the CI integration.
- Two distinct Lingui bootstrap patterns exist in the org:
  1. **Singleton + `dynamicActivate`** (twenty-front,
     `src/utils/i18n/dynamicActivate.ts`): client-side SPA. One
     `i18n` instance, switched at runtime. Works because the SPA
     has one user and one locale at a time.
  2. **Per-render `setupI18n` instance** (twenty-emails,
     `src/utils/i18n.utils.ts` → `createI18nInstance(locale)`):
     each render gets its own `I18n`, memoized per locale. Works
     for SSR/RSC because each request can be a different locale
     and there is no module-level singleton to corrupt across
     concurrent requests.

The marketing site is RSC + SSR, so **pattern (2) is the one to
mirror**, not (1). Same approach, different package.

Existing content pipeline machinery worth knowing about:

- **MDX is already wired for release notes** (`src/content/releases/*.mdx`
  → `gray-matter` + `remark-gfm` → `ReleaseNotes/components/ReleaseMarkdown.tsx`).
- A blog pipeline exists (`src/lib/blog/list-blog-posts.ts` + zod
  frontmatter schema) but `src/content/blog/` is empty and the slug
  route currently `notFound()`s with a TODO.
- Two server-fetched content sources at request time: GitHub release
  tag, Discord/GitHub community stats — both `unstable_cache`d.

Phase 14.3 (legal pages → MDX) and 14.2 (customer pages → MDX +
catalog) are independent decisions: they reuse the existing MDX
pipeline regardless. With Lingui in scope they also gain a
**per-locale folder structure** (`src/content/<kind>/<locale>/<slug>.mdx`),
matching how the org already separates app strings (Lingui PO,
Crowdin app project) from long-form docs (Crowdin docs project,
see `.github/crowdin-docs.yml`).

---

## Why Lingui (and not the alternatives)

### Why not `next-intl`

`next-intl` is the obvious "fits Next.js best" pick on its own
merits, and it's the right answer for a greenfield Next.js shop.
But this isn't a greenfield shop:

- The org already runs Lingui on a Crowdin project ID 1 with 30
  locales translated. `next-intl` uses JSON catalogs, Lingui uses
  PO. Splitting the catalog format splits the Crowdin project
  (`crowdin-app.yml` would either need a second `files[]` entry for
  JSON or a second project ID), splits the translator glossary,
  and gives translators two tools to learn.
- `next-intl`'s strength is App Router-native APIs (`useTranslations`,
  request-config). Lingui hits parity through its own per-render
  pattern (already proven in `twenty-emails`); we don't gain
  anything by leaving the org standard.
- The migration cost asymmetry runs the other way too — adopting
  `next-intl` here would mean either the marketing site stays an
  i18n island forever, or someone eventually re-migrates either
  this package off `next-intl` or the other three off Lingui. Both
  are bad outcomes.

If a future maintainer comes back to this with "but `next-intl` is
better for App Router," the answer is: **org consistency outweighs
per-package optimum**, and the SSR-friendly Lingui pattern from
`twenty-emails` closes the integration gap.

### Why not "consolidated TypeScript copy modules, English-only"

This was the recommendation the previous draft of this doc made,
on the assumption that i18n was 12+ months out. The owner has
clarified that assumption is wrong: **the product is global,
i18n is on the table.** Once that's true:

- TypeScript-only modules don't solve i18n. They'd need to be
  re-shaped into a catalog system later.
- The duplication problem they targeted (drift between inline
  strings and `*.data.ts`) gets solved for free by Lingui's macro
  pass — every string lives in exactly one PO entry, identified
  by message ID, and the same string in two places becomes one
  catalog row.

So Lingui delivers the duplication win and the i18n win in one
migration instead of two.

### Why not a headless CMS (yet)

CMS is about edit velocity for non-engineers, not about i18n. The
two largest CMS providers (Contentful, Sanity) both layer i18n on
top of their content model, but adopting one for that purpose
would mean either bypassing Lingui (fragmenting the translation
pipeline) or running both (paying twice).

Edit velocity is a separate, future decision. Today there's no
measured signal that "PR turnaround for copy changes" is the
bottleneck on a marketing campaign cadence. If/when there is, CMS
becomes a focused decision scoped to the highest-churn surfaces
(probably hero copy + signup CTAs), and Lingui keeps owning the
strings — most CMS products either integrate with Lingui (Strapi)
or can export to Lingui's PO format.

---

## Migration plan

Four phases. **Phase 1 is the go/no-go.** Phases 2–4 are mechanical
once Phase 1 lands cleanly.

### Phase 1 — Foundation (1 week, single PR)

The go/no-go phase. Validates that Lingui's SWC plugin, Next.js 16,
and the React Compiler all coexist before any string migration
starts.

1. **Add deps** to `packages/twenty-website-new/package.json`:
   - `@lingui/core`, `@lingui/react`, `@lingui/macro`,
     `@lingui/swc-plugin`, `@lingui/detect-locale` →
     `dependencies`.
   - `@lingui/cli`, `@lingui/conf`, `@lingui/format-po` →
     `devDependencies`.
   - Pin to the same minor version range used by `twenty-front` /
     `twenty-emails` so PO catalog format and CLI behavior stay in
     lockstep. Bump org-wide if a major lands.
2. **Add `lingui.config.ts`** at the package root. Copy from
   `twenty-front/lingui.config.ts` verbatim — same locale list
   (`twenty-shared/translations`), same `formatter`, same
   `compileNamespace: 'ts'`, same `catalogsMergePath`.
3. **Wire SWC plugin** into `next.config.ts` via
   `experimental.swcPlugins: [['@lingui/swc-plugin', {}]]`. Confirm
   `next-with-linaria` doesn't strip it (it shouldn't — it only
   wraps the Webpack hook).
4. **Add `app/[locale]/` segment.** Move every existing route under
   `src/app/<route>/` to `src/app/[locale]/<route>/`. Add `src/app/layout.tsx`
   per-locale `<html lang={locale}>`. Keep `src/app/api/` at root —
   API routes are not localized.
5. **Add middleware** at `src/middleware.ts` that detects locale
   from cookie / `Accept-Language` / `?locale=` and rewrites the URL
   to `/<locale>/<rest>`. Default to `en`. Excludes `/api/*`,
   `/_next/*`, `/favicon.ico`, etc.
6. **Add `src/lib/i18n/createI18nInstance.ts`** — direct port of
   the `twenty-emails` pattern (`setupI18n` + memoized per-locale
   map). Imports `messages` from `src/locales/generated/<locale>.ts`.
7. **Mount `<I18nProvider>` in `app/[locale]/layout.tsx`.** Server
   component creates the instance for the resolved locale and
   passes it into a client `<I18nProviderClient>` boundary.
8. **Add Nx targets** to `project.json`: `lingui:extract` and
   `lingui:compile`, copy from `twenty-front/project.json` —
   identical executor and command.
9. **Seed `src/locales/en.po` with one string** (e.g. the home
   hero headline) translated via `t` macro. Run `lingui:extract`
   and `lingui:compile` locally to confirm the toolchain works
   end-to-end. This is the smoke test.
10. **Add `pseudo-en` to the active locales** so QA can spot
    untranslated leaks visually (Lingui's pseudo-locale wraps
    every translated string in `[~ original ~]`).
11. **Locale-prefix redirects** in `next.config.ts`: every existing
    redirect rule (the ~14 entries already there) gets mirrored to
    its `/[locale]/` form, plus a root-redirect `/foo` → `/<detected-locale>/foo`
    handled by the middleware. Inbound links keep working.

**Exit criteria for Phase 1:**

- `nx build twenty-website-new` succeeds with the SWC plugin and
  React Compiler both active.
- `nx run twenty-website-new:lingui:extract` produces a non-empty
  `src/locales/en.po`.
- `/pricing` and `/en/pricing` both resolve correctly, with the
  former 308-redirecting to the latter.
- `pseudo-en` mode visibly wraps the seeded string.
- `nx test`, `nx lint`, `nx typecheck` clean.

If any of these fail, the migration stops and the SWC-plugin /
React-Compiler interaction gets investigated as a discovery PR
before Phase 2 is greenlit.

### Phase 2 — String migration (≈2 weeks, in waves)

One PR per route, mechanical: replace inline strings with `t`
macro calls and replace `*.data.ts` exports with copy-shaped
data + `t` macros at consumption sites.

Order (highest-leverage first):

1. **Shared CTAs and tagline family** — the "Get started", "Talk to
   us", "#1 open source CRM" and variants. Land this first because
   every other PR consumes it.
2. **Home** — `src/app/[locale]/(home)/` and the giant
   `hero.data.ts`. **Coordinate with Phase 14.1 (decompose visuals)**
   so the same hands extract copy as decompose components — same
   touch, two wins.
3. **Pricing** — plan tables and engagement band.
4. **Product** — feature cards and value props.
5. **Partners**, **Why Twenty**, **Releases** — smaller routes.
6. **Customers** — coordinate with Phase 14.2; the long-form case
   study text moves to per-locale MDX (see Phase 4 below), the
   metadata moves to `t` macros.
7. **Enterprise** — last because billing/checkout flows are
   sensitive and we want the macro pattern stable first.

The `<Section>/data.ts` files (`Faq`, `Footer`, `Menu`, `Plans`,
`TrustedBy`) are **structural config**, not copy — they hold link
shapes, ordering, feature flags. Their `label`/`title` fields move
to `t` macros at the rendering site; the file structure stays put.
Don't churn them for cosmetic consistency.

### Phase 3 — Crowdin / CI integration (1 day)

Effectively a config-only PR.

1. Extend `.github/workflows/i18n-push.yaml`:
   ```yaml
   - name: Extract translations
     run: |
       npx nx run twenty-server:lingui:extract
       npx nx run twenty-emails:lingui:extract
       npx nx run twenty-front:lingui:extract
       npx nx run twenty-website-new:lingui:extract  # NEW
   - name: Compile translations
     run: |
       # …same pattern…
       npx nx run twenty-website-new:lingui:compile  # NEW
   ```
   Same edit in `i18n-pull.yaml` (or whatever the pull side runs).
2. **No `crowdin-app.yml` change needed** — the `**/en.po` glob
   already picks up the new package.
3. Add a Cursor / lint check that any `*.data.ts` or component
   under `src/app/[locale]/` doesn't reintroduce string literals
   in props that look human-facing (heuristic: `title`, `label`,
   `description`, `cta`, `subtitle`). Fits the existing
   `scripts/check-*.mjs` pattern.

### Phase 4 — SEO, switcher, MDX, Intl polish (≈3 days)

Locale support is "real" only after these land:

1. **`<link rel="alternate" hreflang>`** added to
   `src/lib/seo/build-page-metadata.ts` for every active locale.
2. **Locale switcher in the footer** — port the pattern from
   `twenty-front/src/pages/settings/profile/appearance/components/LocalePicker.tsx`,
   adapted to set a cookie + navigate to `/<locale>/<currentPath>`.
3. **MDX per-locale folders.** `src/content/releases/<locale>/`,
   `src/content/customers/<locale>/`, `src/content/legal/<locale>/`.
   English `notFound()` falls back through `SOURCE_LOCALE`. This is
   how `twenty-emails` handles long-form translatable content
   today.
4. **Drop hardcoded `'en-US'` / `'en'`** in the 5
   `Intl.DateTimeFormat` / `Intl.NumberFormat` call sites; pass the
   active locale instead.
5. **Pass locale into Cal.com** via
   `@calcom/embed-react`'s locale prop so the booking widget
   matches site language.
6. **Stripe Checkout** — set `locale` on the session create call
   (already constructed server-side in `app/api/enterprise/`,
   easy add).

---

## What 14.4 unblocks (after Phase 1 lands)

- **Phase 14.1 (decompose visuals)** — copy gets extracted into
  `t` / `<Trans>` calls during decomposition, not into TypeScript
  modules. Same scope, different shape.
- **Phase 14.2 (customer pages → MDX + catalog)** — long-form goes
  to `src/content/customers/<locale>/<slug>.mdx`; catalog metadata
  goes through Lingui macros.
- **Phase 14.3 (legal → MDX)** — same per-locale MDX folder
  pattern. `TermsDocument.tsx` (~515 LOC) and
  `PrivacyPolicyDocument.tsx` (~814 LOC) become 1 MDX per locale.

Until Phase 1 lands cleanly, **14.1 / 14.2 / 14.3 should not start
extracting copy** — the target shape isn't real until the
toolchain is proven.

---

## Open questions / risks

These need to be answered during Phase 1 (the discovery work),
not deferred.

1. **Lingui SWC plugin × Next.js 16 × React Compiler.** The org's
   existing Lingui packages run on Vite, not Next. The SWC plugin
   is documented to work with Next 13+, but the React Compiler
   adds another transform step and is itself unstable.
   **Mitigation:** Phase 1 step 9 (the smoke test). If it fails,
   fallback is the Babel macro (`@lingui/macro` + `babel-plugin-macros`)
   which is slower but battle-tested. Don't continue Phase 2 until
   one path works.
2. **`next-with-linaria` and SWC plugins.** The package wraps
   `withLinaria` around the config; it modifies Webpack hooks but
   should leave `experimental.swcPlugins` alone. Verify by
   inspecting the merged config (Next prints it on
   `--debug-config-merge`).
3. **MDX × Lingui macros.** Lingui's macros are JSX/TSX-only.
   MDX files don't get auto-extracted. **The intentional design** is
   per-locale MDX folders (above) — long-form prose belongs to
   the translator wholesale, not as fragmented catalog entries.
4. **URL change blast radius.** Every existing inbound link, every
   social-card OG tag, every email link, every search-engine-indexed
   URL becomes `/<locale>/<rest>`. The middleware redirect rules
   handle it, but this needs a SEO-side announcement and a
   sitemap regeneration as part of Phase 1's exit criteria.
5. **Bundle-size impact.** Lingui's runtime is ~7 KB gzipped; the
   per-locale message catalog adds ~5–15 KB per locale, only the
   active one is loaded. Verify on Phase 1 that `next build`'s
   first-load JS doesn't regress more than ~10 KB.
6. **`scripts/check-boundaries.mjs`.** New paths
   (`src/lib/i18n/`, `app/[locale]/`, `src/middleware.ts`) need to
   be allow-listed in the boundary script. One-line edits.

---

## Cost

- **Phase 1 (foundation):** ~1 week engineering, single PR. The
  go/no-go.
- **Phase 2 (string migration):** ~2 weeks, in waves of 1 PR per
  route, parallelizable across engineers after Phase 1 sets the
  pattern.
- **Phase 3 (CI integration):** ~1 day, config-only.
- **Phase 4 (polish):** ~3 days.

Total: **~3–4 weeks engineering, mostly parallelizable** to other
Phase 14 work after Phase 1.

Recurring: marketing-site word counts join the existing Crowdin
billing line for the app project (project ID 1). No new vendor,
no new tooling cost. Translation cost scales with content volume,
which today is ~3,500 LOC of named copy + ~995 LOC of inline
case-study text + ~1,329 LOC of legal — most of which (the legal
text) is already locale-bound by jurisdiction anyway.

---

## What this decision does NOT do

- Does **not** ship every locale on day one. Foundation lands with
  `en` + `pseudo-en` only. Locales drop in via Crowdin sync as
  translators complete them, exactly the same flow as the rest of
  the org.
- Does **not** restructure `<Section>/data.ts` files
  (`Faq`/`Footer`/`Menu`/`Plans`/`TrustedBy`) — they're config,
  not copy. Their `label`/`title` fields move to `t` macros at
  the rendering site, file structure stays put.
- Does **not** remove the existing `*.data.ts` files in one PR —
  they migrate alongside their owning route in Phase 2's waves.
- Does **not** commit to a CMS. Edit velocity for non-engineers
  is a separate, future decision (Phase 15+ or beyond).
- Does **not** change the API surface of `src/app/api/*`. API
  routes remain non-localized (they're machine-to-machine, not
  user-facing).

---

## Sign-off

The deliverable here is approval of the **migration plan**, not
a choice between options. The decision (adopt Lingui) follows
directly from the i18n requirement and the org consistency
argument; the plan is what's open for review.

- [ ] Owner has read the full document.
- [ ] Migration plan approved as-is, OR with the following
      modifications: \***\*\_\_\*\***
- [ ] Date: \***\*\_\_\*\***
- [ ] Phase 1 owner: \***\*\_\_\*\*** (must be one engineer
      end-to-end through the foundation PR; downstream phases can
      parallelize).
- [ ] Phase 1 exit criteria above are the merge bar; if any fail,
      the PR does not land and a discovery PR investigates the
      Lingui × Next.js 16 × React Compiler interaction first.
