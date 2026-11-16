import { type FieldMetadataComputation } from 'twenty-shared/types';

import { FORMULA_COMPUTED_FIELD_KIND_DESCRIPTION } from 'src/engine/metadata-modules/computed-field/constants/formula-computed-field-kind-description.constant';
import { ROLLUP_COMPUTED_FIELD_KIND_DESCRIPTION } from 'src/engine/metadata-modules/computed-field/constants/rollup-computed-field-kind-description.constant';
import { type ComputedFieldKindDescription } from 'src/engine/metadata-modules/computed-field/types/computed-field-kind-description.type';

export const COMPUTED_FIELD_KIND_DESCRIPTIONS: Record<
  FieldMetadataComputation['kind'],
  ComputedFieldKindDescription
> = {
  FORMULA: FORMULA_COMPUTED_FIELD_KIND_DESCRIPTION,
  ROLLUP: ROLLUP_COMPUTED_FIELD_KIND_DESCRIPTION,
};
