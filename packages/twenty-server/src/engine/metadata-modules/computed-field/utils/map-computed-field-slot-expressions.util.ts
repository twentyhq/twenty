import { isString } from '@sniptt/guards';
import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { COMPUTED_FIELD_KIND_DESCRIPTIONS } from 'src/engine/metadata-modules/computed-field/constants/computed-field-kind-descriptions.constant';
import { type ComputedFieldSlotExpression } from 'src/engine/metadata-modules/computed-field/types/computed-field-slot-expression.type';

// The one place that knows where a slot keeps its expressions in a computation
export const mapComputedFieldSlotExpressions = <
  TComputation extends FieldMetadataComputation,
>({
  computation,
  mapExpression,
}: {
  computation: TComputation;
  mapExpression: (slotExpression: ComputedFieldSlotExpression) => string;
}): TComputation => {
  const properties: Record<string, unknown> = computation;

  return {
    ...computation,
    ...Object.fromEntries(
      COMPUTED_FIELD_KIND_DESCRIPTIONS[
        computation.kind
      ].expressionSlots.flatMap((slot): [string, unknown][] => {
        const { property, listItemProperty } = slot;
        const value = properties[property];

        if (isString(value)) {
          return [[property, mapExpression({ slot, expression: value })]];
        }

        if (!isDefined(listItemProperty) || !Array.isArray(value)) {
          return [];
        }

        return [
          [
            property,
            value.map((item) =>
              isPlainObject(item) && isString(item[listItemProperty])
                ? {
                    ...item,
                    [listItemProperty]: mapExpression({
                      slot,
                      expression: item[listItemProperty],
                    }),
                  }
                : item,
            ),
          ],
        ];
      }),
    ),
  };
};
