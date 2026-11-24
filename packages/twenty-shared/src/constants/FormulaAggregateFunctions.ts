// An aggregate reads the records of a one-to-many relation, so only a stored formula can use one
export const FORMULA_AGGREGATE_FUNCTIONS = {
  count: { signature: 'count(relation, condition?)' },
  sum: { signature: 'sum(relation.field, condition?)' },
  avg: { signature: 'avg(relation.field, condition?)' },
  min: { signature: 'min(relation.field, condition?)' },
  max: { signature: 'max(relation.field, condition?)' },
} as const;
