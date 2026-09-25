import { VALIDATION_RULE_AGGREGATE_FUNCTIONS } from '@/constants/ValidationRuleAggregateFunctions';
import { type ValidationRuleAggregate } from '@/types/ValidationRuleAggregate';
import { type ValidationRuleAggregateValues } from '@/types/ValidationRuleAggregateValues';

export const buildValidationRuleEmptySetAggregateValues = (
  aggregates: ValidationRuleAggregate[],
): Record<string, ValidationRuleAggregateValues> =>
  aggregates.reduce<Record<string, ValidationRuleAggregateValues>>(
    (
      aggregateValuesByRelationFieldName,
      { functionName, relationFieldName },
    ) => ({
      ...aggregateValuesByRelationFieldName,
      [relationFieldName]: {
        ...aggregateValuesByRelationFieldName[relationFieldName],
        [functionName]:
          VALIDATION_RULE_AGGREGATE_FUNCTIONS[functionName].valueOnEmptySet,
      },
    }),
    {},
  );
