// Catalogs Crowdin holds for Twenty: Lingui PO for the app and website, MDX for
// the docs. ICU braces mean something different in each, so rules declare which
// they are safe to run against rather than being opted in per workflow.
export type CatalogFormat = 'po' | 'mdx';

export type NormalizationRule = {
  name: string;
  formats: CatalogFormat[];
  detect: (text: string, sourceText?: string) => boolean;
  // Returning an empty string means the translation could not be salvaged and
  // should be deleted rather than replaced.
  fix: (text: string, sourceText?: string) => string;
  // Set by rules that compare a translation against its source but select every
  // string rather than narrowing with sourceFilter.
  needsSourceText?: boolean;
  sourceFilter?: (sourceText: string) => boolean;
};
