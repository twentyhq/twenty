import { type NormalizationRule } from '../types/normalization-rule.type';

export function evaluateRules({
  rules,
  sourceText,
  translationText,
}: {
  rules: NormalizationRule[];
  sourceText: string | undefined;
  translationText: string;
}): { fixedText: string; ruleNames: string[] } {
  return rules.reduce<{ fixedText: string; ruleNames: string[] }>(
    (accumulator, rule) => {
      const isFilteredOut =
        rule.sourceFilter !== undefined &&
        (sourceText === undefined || !rule.sourceFilter(sourceText));

      if (isFilteredOut || !rule.detect(accumulator.fixedText)) {
        return accumulator;
      }

      return {
        fixedText: rule.fix(accumulator.fixedText),
        ruleNames: [...accumulator.ruleNames, rule.name],
      };
    },
    { fixedText: translationText, ruleNames: [] },
  );
}
