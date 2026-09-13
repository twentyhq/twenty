export type NormalizationRule = {
  name: string;
  detect: (text: string, sourceText?: string) => boolean;
  // Returning an empty string means the translation could not be salvaged and
  // should be deleted rather than replaced.
  fix: (text: string, sourceText?: string) => string;
  // Set by rules that compare a translation against its source but select every
  // string rather than narrowing with sourceFilter.
  needsSourceText?: boolean;
  sourceFilter?: (sourceText: string) => boolean;
};
