// An aggregate reads the records of a one-to-many relation, so only a stored formula can use one
export const FORMULA_AGGREGATE_FUNCTION_NAMES = [
  'count',
  'sum',
  'avg',
  'min',
  'max',
] as const;
