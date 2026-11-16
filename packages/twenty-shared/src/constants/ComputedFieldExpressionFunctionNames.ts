export const COMPUTED_FIELD_EXPRESSION_FUNCTION_NAMES = [
  'if',
  'coalesce',
  'isDefined',
  'isEmpty',
  'min',
  'max',
  'round',
  'concat',
  'lower',
  'upper',
  'length',
  'daysBetween',
  'daysSince',
] as const;

export type ComputedFieldExpressionFunctionName =
  (typeof COMPUTED_FIELD_EXPRESSION_FUNCTION_NAMES)[number];
