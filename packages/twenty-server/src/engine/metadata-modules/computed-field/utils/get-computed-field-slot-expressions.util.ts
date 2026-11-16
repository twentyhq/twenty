import { type FieldMetadataComputation } from 'twenty-shared/types';

import { type ComputedFieldSlotExpression } from 'src/engine/metadata-modules/computed-field/types/computed-field-slot-expression.type';
import { mapComputedFieldSlotExpressions } from 'src/engine/metadata-modules/computed-field/utils/map-computed-field-slot-expressions.util';

// The expressions the computation holds, each with the slot that says how it is evaluated
export const getComputedFieldSlotExpressions = (
  computation: FieldMetadataComputation,
): ComputedFieldSlotExpression[] => {
  const slotExpressions: ComputedFieldSlotExpression[] = [];

  mapComputedFieldSlotExpressions({
    computation,
    mapExpression: (slotExpression) => {
      slotExpressions.push(slotExpression);

      return slotExpression.expression;
    },
  });

  return slotExpressions;
};
