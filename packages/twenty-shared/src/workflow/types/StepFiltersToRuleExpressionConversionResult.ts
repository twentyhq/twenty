export type StepFiltersToRuleExpressionConversionResult =
  | { isConvertible: true; expression: string }
  | { isConvertible: false; reason: string };
