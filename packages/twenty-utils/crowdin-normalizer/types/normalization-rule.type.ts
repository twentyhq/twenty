export type NormalizationRule = {
  name: string;
  detect: (text: string) => boolean;
  fix: (text: string) => string;
  sourceFilter?: (sourceText: string) => boolean;
};
