/**
 * Named width tokens for editorial layout containers.
 *
 * Use these instead of inline `max-width: <px>` whenever a container is
 * constraining text-flow width or a hero/intro block. Hard-coded pixel
 * widths inside individual components are fine when they describe a
 * bespoke geometric layout (e.g. a single illustration block) — the
 * tokens below cover the small set of *recurring* widths the site
 * actually shares.
 *
 * | Token          | Px    | Used by                                                     |
 * | -------------- | ----- | ----------------------------------------------------------- |
 * | readingNarrow  | 720   | Legal documents (`LegalDocument`).                          |
 * | readingWide    | 800   | Long-form release notes (`ReleaseNotes`).                   |
 * | editorial      | 921   | Section signoff headings + home ThreeCards intro heading.   |
 *
 * `maxContent` (1440) already lives on `theme.breakpoints.maxContent`
 * and is consumed by `<Container>` — kept there so existing call sites
 * don't have to migrate.
 */
export const layout = {
  readingNarrow: '720px',
  readingWide: '800px',
  editorial: '921px',
} as const;

export type LayoutToken = keyof typeof layout;
