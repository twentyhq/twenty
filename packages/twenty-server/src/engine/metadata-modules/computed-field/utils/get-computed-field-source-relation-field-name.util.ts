import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { COMPUTED_FIELD_KIND_DESCRIPTIONS } from 'src/engine/metadata-modules/computed-field/constants/computed-field-kind-descriptions.constant';
import { getComputedFieldComputationTextProperty } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-computation-text-property.util';

export const getComputedFieldSourceRelationFieldName = (
  computation: FieldMetadataComputation,
): string | undefined => {
  const { sourceRelationProperty } =
    COMPUTED_FIELD_KIND_DESCRIPTIONS[computation.kind];

  return isDefined(sourceRelationProperty)
    ? getComputedFieldComputationTextProperty({
        computation,
        property: sourceRelationProperty,
      })
    : undefined;
};
