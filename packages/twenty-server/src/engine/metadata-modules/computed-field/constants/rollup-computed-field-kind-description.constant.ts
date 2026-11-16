import { FIELD_METADATA_ROLLUP_OPERATIONS } from 'twenty-shared/constants';
import {
  type FieldMetadataRollupComputation,
  FieldMetadataType,
} from 'twenty-shared/types';

import { type ComputedFieldKindDescription } from 'src/engine/metadata-modules/computed-field/types/computed-field-kind-description.type';
import { assertComputedValueFitsFieldTypeOrThrow } from 'src/engine/metadata-modules/computed-field/utils/assert-computed-value-fits-field-type-or-throw.util';
import { getRollupComputedValueTypeOrThrow } from 'src/engine/metadata-modules/computed-field/utils/get-rollup-computed-value-type-or-throw.util';

// Whether the expression is needed, and what it may return, depends on the operation: a rule, not a slot
export const ROLLUP_COMPUTED_FIELD_KIND_DESCRIPTION: ComputedFieldKindDescription<FieldMetadataRollupComputation> =
  {
    readableShape:
      'a rollup with a relation, an operation and optional expression and filter',
    sourceRelationProperty: 'relationFieldName',
    allowedValuesByProperty: { operation: FIELD_METADATA_ROLLUP_OPERATIONS },
    expressionSlots: [
      {
        property: 'expression',
        evaluatedOn: 'RELATED_RECORD',
        isRequired: false,
      },
      {
        property: 'filter',
        evaluatedOn: 'RELATED_RECORD',
        isRequired: false,
        valueTypes: [FieldMetadataType.BOOLEAN],
      },
    ],
    assertIsValidOrThrow: ({
      computation,
      fieldType,
      valueTypeBySlotProperty,
    }) =>
      assertComputedValueFitsFieldTypeOrThrow({
        fieldType,
        valueType: getRollupComputedValueTypeOrThrow({
          computation,
          expressionValueType: valueTypeBySlotProperty.expression,
        }),
      }),
  };
