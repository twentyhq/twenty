import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { COMPUTED_FIELD_KIND_DESCRIPTIONS } from 'src/engine/metadata-modules/computed-field/constants/computed-field-kind-descriptions.constant';
import { type ComputedFieldSlotExpression } from 'src/engine/metadata-modules/computed-field/types/computed-field-slot-expression.type';
import { getComputedFieldComputationTextProperty } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-computation-text-property.util';

// The expressions the computation holds, each with the slot that says how it is evaluated
export const getComputedFieldSlotExpressions = (
  computation: FieldMetadataComputation,
): ComputedFieldSlotExpression[] =>
  COMPUTED_FIELD_KIND_DESCRIPTIONS[computation.kind].expressionSlots.flatMap(
    (slot) => {
      const expression = getComputedFieldComputationTextProperty({
        computation,
        property: slot.property,
      });

      return isDefined(expression) ? [{ slot, expression }] : [];
    },
  );
