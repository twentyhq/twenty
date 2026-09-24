import { type ValidationRuleAggregateFunctionName } from '@/types/ValidationRuleAggregateFunctionName';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

export const readValidationRuleAggregateValue = (
  aggregateValues: unknown,
  functionName: ValidationRuleAggregateFunctionName,
): unknown => {
  if (!isPlainObject(aggregateValues) || !(functionName in aggregateValues)) {
    throw new Error(`Missing ${functionName}() value`);
  }

  return aggregateValues[functionName];
};
