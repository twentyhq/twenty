import { type ComputedFieldExpressionBinaryOperator } from 'twenty-shared/types';

export const COMPUTED_FIELD_EXPRESSION_BINARY_OPERATOR_SQL = {
  '+': (left, right) => `(${left} + ${right})`,
  '-': (left, right) => `(${left} - ${right})`,
  '*': (left, right) => `(${left} * ${right})`,
  // Integer columns would truncate, and a zero divisor would fail the whole query
  '/': (left, right) => `(${left}::numeric / NULLIF(${right}, 0))`,
  // MOD has no float variant, the column type of a NUMBER field
  '%': (left, right) => `MOD(${left}::numeric, NULLIF(${right}, 0)::numeric)`,
  '==': (left, right) => `(${left} = ${right})`,
  // "<>" is null, so false, for a record whose value is missing
  '!=': (left, right) => `(${left} IS DISTINCT FROM ${right})`,
  '<': (left, right) => `(${left} < ${right})`,
  '<=': (left, right) => `(${left} <= ${right})`,
  '>': (left, right) => `(${left} > ${right})`,
  '>=': (left, right) => `(${left} >= ${right})`,
  and: (left, right) => `(${left} AND ${right})`,
  or: (left, right) => `(${left} OR ${right})`,
  '||': (left, right) => `CONCAT(${left}, ${right})`,
  in: (left, list) => `(${left} IN ${list})`,
} satisfies Record<
  ComputedFieldExpressionBinaryOperator,
  (left: string, right: string) => string
>;
