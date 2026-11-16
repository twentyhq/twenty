import { type ComputedFieldExpressionVariableName } from 'twenty-shared/types';

export const COMPUTED_FIELD_EXPRESSION_VARIABLE_SQL = {
  now: 'NOW()',
  // The database's time zone is a deployment detail, so the day is the UTC one
  today: "(NOW() AT TIME ZONE 'UTC')::date",
} as const satisfies Record<ComputedFieldExpressionVariableName, string>;
