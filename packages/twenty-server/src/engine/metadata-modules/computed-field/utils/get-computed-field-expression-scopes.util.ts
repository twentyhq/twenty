import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Which record each expression of a computation is evaluated on: the field's own, or a related one
export const getComputedFieldExpressionScopes = (
  computation: FieldMetadataComputation,
): { expression: string; isEvaluatedOnRelatedRecord: boolean }[] => {
  if (computation.kind === 'FORMULA') {
    return [
      { expression: computation.expression, isEvaluatedOnRelatedRecord: false },
    ];
  }

  return [computation.expression, computation.filter]
    .filter(isDefined)
    .map((expression) => ({ expression, isEvaluatedOnRelatedRecord: true }));
};
