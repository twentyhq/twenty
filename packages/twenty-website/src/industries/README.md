# Industry pages

Every `/solutions/<slug>` page is one data file in `pages/`, rendered by
`sections/industry-page/IndustryPage.tsx` in a fixed order. Pages supply
content, never layout.

## Adding a page

1. Write `pages/<slug>.industry-page.ts` exporting one `IndustryCategoryPage`
   or `IndustrySubCategoryPage`.
2. Add it to `industry-pages.ts`.
3. Run `npx jest src/industries --config=jest.config.mjs`. The test resolves
   every page and fails on any rule below.
4. Keep `status: 'draft'` until the copy is reviewed. Drafts render at their
   URL with `noindex`.

A sub-category page inherits its category. It states its hero, product
preview, added objects and three workflows, and may replace the custom
screen or proof. To reuse a category workflow, reference it from the
category's data file; nothing is inherited silently. Its questions come
first, then the category's, up to six.

## The product window

The hero renders the site's app mockup from the page data: the workspace
name, one sidebar entry per object, the authored table, the preview record
as a favorite (opening on the custom screen as its first tab), and every
workflow as a canvas under Workflows. Objects without authored rows open as
empty views of their fields.

## What the types enforce

- Exactly four complaints, three modelling notes, three workflows and five
  discovery questions.
- Each complaint names the section that answers it.
- Proof is a real case-study slug or `{ kind: 'none' }`, which renders no
  section at all.

## What the test enforces

- Every object id used by relations, agents, the custom screen, access rules,
  Salesforce mappings and the preview exists in the data model, or is a
  standard object (`person`, `company`, `task`, `note`).
- Every agent writes at least one object; preview rows fill every column.
- Workflows start with a trigger and have two to six steps; one to three
  agents; three to six questions; every access rule covers every role.
- Copy: no phrase from `industry-banned-phrases.ts`, no exclamation marks, no
  emoji, no sentence over 25 words, hero headline under 80 characters.
- `[placeholders]` are allowed on drafts and refused on live pages.

## What review still owns

- Every number has a source the reviewer has opened (a customer story, a
  public price page). The test cannot check this.
- Anything a customer did is in their published story; anything else is
  framed as an example of what a team can build.
- Product claims match what Twenty ships today.
