import { type ValidationRuleAggregateFunctionName } from 'twenty-shared/types';

export const VALIDATION_RULE_AGGREGATE_SQL_EXPRESSION_BY_FUNCTION_NAME = {
  count: 'COUNT(*)',
} as const satisfies Record<ValidationRuleAggregateFunctionName, string>;
