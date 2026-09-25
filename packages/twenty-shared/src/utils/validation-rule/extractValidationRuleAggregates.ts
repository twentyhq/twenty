import { type ValidationRuleAggregate } from '@/types/ValidationRuleAggregate';
import { collectValidationRuleAggregateCalls } from '@/utils/validation-rule/collectValidationRuleAggregateCalls';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';

export const extractValidationRuleAggregates = (
  expression: string,
): ValidationRuleAggregate[] => {
  const { aggregateCalls } = collectValidationRuleAggregateCalls(
    parseValidationRuleExpression(expression).tokens,
  );

  const aggregateByKey = new Map<string, ValidationRuleAggregate>();

  for (const { functionName, argumentPaths } of aggregateCalls) {
    const [relationFieldName] = argumentPaths;

    if (argumentPaths.length === 1 && typeof relationFieldName === 'string') {
      aggregateByKey.set(`${functionName}(${relationFieldName})`, {
        functionName,
        relationFieldName,
      });
    }
  }

  return [...aggregateByKey.values()];
};
