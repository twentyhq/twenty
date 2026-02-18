import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type BuildAggregateFieldKeyParams = {
  aggregateOperation: AggregateOperations;
  aggregateFieldMetadata: FlatFieldMetadata;
};

export const buildAggregateFieldKey = ({
  aggregateOperation,
  aggregateFieldMetadata,
}: BuildAggregateFieldKeyParams): string => {
  const fieldName = aggregateFieldMetadata.name;
  const fieldType = aggregateFieldMetadata.type;

  switch (aggregateOperation) {
    case AggregateOperations.COUNT:
      return 'totalCount';

    case AggregateOperations.COUNT_UNIQUE_VALUES:
      return `countUniqueValues${capitalize(fieldName)}`;

    case AggregateOperations.COUNT_EMPTY:
      return `countEmpty${capitalize(fieldName)}`;

    case AggregateOperations.COUNT_NOT_EMPTY:
      return `countNotEmpty${capitalize(fieldName)}`;

    case AggregateOperations.PERCENTAGE_EMPTY:
      return `percentageEmpty${capitalize(fieldName)}`;

    case AggregateOperations.PERCENTAGE_NOT_EMPTY:
      return `percentageNotEmpty${capitalize(fieldName)}`;

    case AggregateOperations.COUNT_TRUE:
      return `countTrue${capitalize(fieldName)}`;

    case AggregateOperations.COUNT_FALSE:
      return `countFalse${capitalize(fieldName)}`;

    case AggregateOperations.MIN:
      if (fieldType === FieldMetadataType.CURRENCY) {
        return `min${capitalize(fieldName)}AmountMicros`;
      }

      return `min${capitalize(fieldName)}`;

    case AggregateOperations.MAX:
      if (fieldType === FieldMetadataType.CURRENCY) {
        return `max${capitalize(fieldName)}AmountMicros`;
      }

      return `max${capitalize(fieldName)}`;

    case AggregateOperations.AVG:
      if (fieldType === FieldMetadataType.CURRENCY) {
        return `avg${capitalize(fieldName)}AmountMicros`;
      }

      return `avg${capitalize(fieldName)}`;

    case AggregateOperations.SUM:
      if (fieldType === FieldMetadataType.CURRENCY) {
        return `sum${capitalize(fieldName)}AmountMicros`;
      }

      return `sum${capitalize(fieldName)}`;
  }
};
