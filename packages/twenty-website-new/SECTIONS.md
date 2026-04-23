# The section contract

A "section" is the unit a page is composed of: Hero, TrustedBy, Faq, Pricing,
Footer, and so on. Sections are page-agnostic primitives — the same
`<Hero.Root>` is used by `app/(home)`, `app/product`, `app/why-twenty`,
`app/releases`, and `app/partners` with different children and different
visuals.

This document is the contract that makes that reuse work. Every section
under `src/sections/` follows it. New sections must.

If you want the broader picture (layering, heavy visuals, env vars), see
[`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 1. Folder layout

```
src/sections/<SectionName>/
├── components/
│   ├── index.ts          # compound export: { Root, Heading, Body, … }
│   ├── Root.tsx
│   ├── Heading.tsx
│   ├── Body.tsx
│   └── …                 # other parts
├── types/
│   ├── index.ts          # barrel re-export (optional)
│   ├── <SectionName>Data.ts
│   └── <Subtype>.ts
├── visuals/              # optional. Heavy WebGL/3D/animation scenes.
│   └── <SceneName>.tsx
├── effect-components/    # optional. Side-effect-only components.
│   └── <Effect>.tsx
├── utils/                # optional. Section-private pure helpers.
└── data.ts               # optional. Cross-page constants for this section.
```

Required minimums: `components/index.ts` and at least `Root.tsx`. Everything
else is added when the section actually needs it. There are no empty index
files — if `types/index.ts` would be empty, delete it.

`SectionName` is `PascalCase`, singular. `Faq`, `Hero`, `Pricing`, `ThreeCards`.

---

## 2. The compound export pattern

A section exposes its parts as named properties on a single object, not as
free-standing exports. Consumers reach into the namespace at the call site:

```tsx
// good
import { Faq } from '@/sections/Faq/components';

<Faq.Root>
  <Faq.Intro>
    <Faq.Heading segments={...} />
    <Faq.Cta>...</Faq.Cta>
  </Faq.Intro>
  <Faq.Items questions={...} />
</Faq.Root>;
```

Why:

- **The page reads as a tree.** `Faq.Root → Faq.Intro → Faq.Heading` matches
  the visual hierarchy. Anyone scanning the page file can see the section's
  shape without opening `Faq/components/Root.tsx`.
- **Renaming a part is a one-line change.** Move `Heading` to
  `IntroHeading` in `components/index.ts` and every page picks it up.
- **The "namespace" hides composition glue.** A section may export a
  `Root` that internally uses CSS variable scopes or a context provider —
  consumers don't need to know.

`components/index.ts` is the only file where the compound object is
assembled. Don't re-build it inline at call sites.

---

## 3. Where data lives

There are exactly two places content can live:

| Where                               | Use when…                                                                                 | Example                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/sections/<Section>/data.ts`    | The data is **cross-page** — every consumer of the section uses the same content.         | `sections/Menu/data.ts` (`MENU_DATA`), `sections/Faq/data.ts`, `sections/Footer/data.ts`.  |
| `src/app/<route>/<section>.data.ts` | The data is **route-specific** — a single page renders this section with bespoke content. | `app/product/hero.data.ts`, `app/why-twenty/marquee.data.ts`, `app/(home)/helped.data.ts`. |

Anti-patterns the contract forbids:

- ❌ A `_constants/` folder anywhere. Constants live in `data.ts` files
  next to whoever uses them.
- ❌ A `data.ts` that isn't used. If you delete a section's last consumer,
  delete the `data.ts` too. (Phase 0 cleaned up seven such orphans.)
- ❌ A `data.ts` at `src/sections/<Section>/data.ts` consumed by exactly
  one route. That data belongs in `app/<route>/<section>.data.ts`.

The data file's only job is to construct an object that satisfies the
section's `<SectionName>DataType`. It must not contain logic, function
calls, or environment-dependent branching.

---

## 4. Types

Each section publishes its public data shape as `<SectionName>DataType`
under `types/`. Conventions:

- The top-level shape is named `<SectionName>Data` and re-exported as
  `<SectionName>DataType` for the call site (Hero, Faq, ProductStepper, …).
- Sub-shapes (e.g. `FaqQuestion`, `WhyTwentyStepperStep`) live in their own
  file and re-export through `types/index.ts`.
- Types belong to the section they describe. **Sections never reach into
  `app/<route>/types.ts`** — that's a layering violation enforced by
  `no-restricted-imports`. If multiple sections share a shape, hoist it into
  `lib/`.

---

## 5. Visuals (`visuals/`)

A section that owns heavy WebGL / 3D / Lottie content puts those scenes
under `visuals/`, and exposes them through a part of the compound object
(e.g. `Hero.ProductVisual`, `Hero.ReleaseNotesVisual`). The contract is set
by `lib/visual-runtime/`:

1. The visual is mounted via `WebGlMount`. Never instantiate a Three.js
   `WebGLRenderer` directly.
2. The visual has a static fallback (an image or simplified DOM) that
   renders when `NEXT_PUBLIC_DISABLE_HEAVY_VISUALS=true` or the WebGL
   context budget is full.
3. Heavy assets go in `public/illustrations/<section>/<scene>/` (NOT
   inlined as base64 into JS).

See [`ARCHITECTURE.md` § Heavy visuals](./ARCHITECTURE.md#3-heavy-visuals-webgl--3d--lottie)
for the full policy and the rationale.

---

## 6. Effect components (`effect-components/`)

An "effect component" is a component that returns `null` and exists only to
attach a side effect (`useEffect`, an event listener, a mutation observer,
etc.). They live in their own folder so it's obvious from the layout that
they don't render UI.

Example: `sections/WhyTwentyStepper/effect-components/SyncScrollProgressFromContainerEffect.tsx`
— attaches a scroll listener that updates a CSS variable on the parent
container. It returns `null`.

Effect components don't accept children. If you find yourself wanting one to
render UI, it's a regular component — move it to `components/`.

---

## 7. Utils (`utils/`)

Section-private pure helpers (geometry math, layout calculations, format
strings) go under `utils/`. Anything that could be useful to a second section
goes in `lib/` instead.

Tests for `utils/` live in `utils/__tests__/` and use the standard project
Jest setup.

---

## 8. Adding a new section

1. Create the folder: `src/sections/<NewName>/`.
2. Define the data shape: `types/<NewName>Data.ts`.
3. Implement the parts under `components/`. Always include `Root.tsx`.
4. Export the compound from `components/index.ts`.
5. If the data is cross-page, add `data.ts`. Otherwise put a route-scoped
   `app/<route>/<new-name>.data.ts` next to the consuming page.
6. Compose the section in the route: `<NewName.Root> … </NewName.Root>`.
7. If the section renders a heavy visual, add it under `visuals/` and mount
   via `WebGlMount` (see [ARCHITECTURE § 3](./ARCHITECTURE.md#3-heavy-visuals-webgl--3d--lottie)).

Don't add `'use client'` unless the section uses a hook or browser API.
Don't import from `@/app/**`. (`oxlint` warns; the rule will become an
error after the cleanup ratchet completes — see
[`ARCHITECTURE.md` § The cleanup ratchet](./ARCHITECTURE.md#4-the-cleanup-ratchet).)
