// The parser reads these as prefix operators; the tree keeps them as function calls, like every other function
export const EXPRESSION_PREFIX_FUNCTION_NAMES = [
  'length',
  'abs',
  'ceil',
  'floor',
  'round',
  'trunc',
] as const;
