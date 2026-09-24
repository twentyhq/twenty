import { VALIDATION_RULE_AGGREGATE_FUNCTIONS } from '@/constants/ValidationRuleAggregateFunctions';
import { type ValidationRuleAggregateFunctionName } from '@/types/ValidationRuleAggregateFunctionName';

export const isValidationRuleAggregateFunctionName = (
  name: string,
): name is ValidationRuleAggregateFunctionName =>
  Object.prototype.hasOwnProperty.call(
    VALIDATION_RULE_AGGREGATE_FUNCTIONS,
    name,
  );
