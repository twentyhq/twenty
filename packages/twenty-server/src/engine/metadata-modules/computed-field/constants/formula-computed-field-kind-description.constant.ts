import { type FieldMetadataFormulaComputation } from 'twenty-shared/types';

import { type ComputedFieldKindDescription } from 'src/engine/metadata-modules/computed-field/types/computed-field-kind-description.type';
import { assertComputedValueFitsFieldTypeOrThrow } from 'src/engine/metadata-modules/computed-field/utils/assert-computed-value-fits-field-type-or-throw.util';

export const FORMULA_COMPUTED_FIELD_KIND_DESCRIPTION: ComputedFieldKindDescription<FieldMetadataFormulaComputation> =
  {
    readableShape: 'a formula with an expression',
    expressionSlots: [
      { property: 'expression', evaluatedOn: 'RECORD', isRequired: true },
    ],
    assertIsValidOrThrow: ({ fieldType, valueTypeBySlotProperty }) =>
      assertComputedValueFitsFieldTypeOrThrow({
        fieldType,
        valueType: valueTypeBySlotProperty.expression,
      }),
  };
