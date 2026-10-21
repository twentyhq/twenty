// ICU braces mean different things in PO and MDX, so rules declare which formats they are safe for.
export type CatalogFormat = 'po' | 'mdx';

export type NormalizationRule = {
  name: string;
  formats: CatalogFormat[];
  detect: (text: string, sourceText?: string) => boolean;
  // An empty string deletes the translation rather than replacing it.
  fix: (text: string, sourceText?: string) => string;
  // For rules that need the source but scan every string instead of using sourceFilter.
  needsSourceText?: boolean;
  sourceFilter?: (sourceText: string) => boolean;
};
