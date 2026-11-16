import {
  type ComputedFieldValueType,
  type FieldMetadataRollupComputation,
  FieldMetadataType,
} from 'twenty-shared/types';
import { ComputedFieldExpressionError, isDefined } from 'twenty-shared/utils';

import { assertComputedFieldValueTypeOrThrow } from 'src/engine/metadata-modules/computed-field/utils/assert-computed-field-value-type-or-throw.util';

const { NUMBER, TEXT, DATE, DATE_TIME } = FieldMetadataType;

export const getRollupComputedValueTypeOrThrow = ({
  computation: { operation, expression },
  expressionValueType,
}: {
  computation: FieldMetadataRollupComputation;
  expressionValueType: ComputedFieldValueType | undefined;
}): ComputedFieldValueType | undefined => {
  if (operation === 'COUNT') {
    if (isDefined(expression)) {
      throw new ComputedFieldExpressionError(
        'COUNT counts the related records and takes no expression; use the filter to count some of them',
      );
    }

    return NUMBER;
  }

  if (!isDefined(expression)) {
    throw new ComputedFieldExpressionError(
      `${operation} needs the expression to aggregate`,
    );
  }

  assertComputedFieldValueTypeOrThrow({
    valueType: expressionValueType,
    expectedTypes:
      operation === 'SUM' || operation === 'AVG'
        ? [NUMBER]
        : [NUMBER, TEXT, DATE, DATE_TIME],
    subject: `The expression of ${operation}`,
  });

  return expressionValueType;
};
