import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const PERCENT_AGGREGATE_OPERATIONS = new Set([
  AggregateOperations.PERCENTAGE_EMPTY,
  AggregateOperations.PERCENTAGE_NOT_EMPTY,
]);

const COUNT_AGGREGATE_OPERATIONS = new Set([
  AggregateOperations.COUNT,
  AggregateOperations.COUNT_UNIQUE_VALUES,
  AggregateOperations.COUNT_EMPTY,
  AggregateOperations.COUNT_NOT_EMPTY,
  AggregateOperations.COUNT_TRUE,
  AggregateOperations.COUNT_FALSE,
]);

type TransformAggregateValueParams = {
  rawValue: unknown;
  aggregateFieldType: FieldMetadataType;
  aggregateOperation: AggregateOperations;
};

export const transformAggregateValue = ({
  rawValue,
  aggregateFieldType,
  aggregateOperation,
}: TransformAggregateValueParams): number => {
  if (!isDefined(rawValue)) {
    return 0;
  }

  const numericValue = Number(rawValue);

  if (isNaN(numericValue)) {
    return 0;
  }

  if (COUNT_AGGREGATE_OPERATIONS.has(aggregateOperation)) {
    return numericValue;
  }

  if (PERCENT_AGGREGATE_OPERATIONS.has(aggregateOperation)) {
    return numericValue * 100;
  }

  if (aggregateFieldType === FieldMetadataType.CURRENCY) {
    return numericValue / 1_000_000;
  }

  return numericValue;
};
