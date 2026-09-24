import { type VALIDATION_RULE_AGGREGATE_FUNCTIONS } from '@/constants/ValidationRuleAggregateFunctions';

export type ValidationRuleAggregateFunctionName =
  keyof typeof VALIDATION_RULE_AGGREGATE_FUNCTIONS;
