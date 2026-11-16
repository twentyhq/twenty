import { type COMPUTED_FIELD_SCALAR_TYPES } from 'src/engine/metadata-modules/computed-field/constants/computed-field-scalar-types.constant';

export type ComputedFieldValueType =
  (typeof COMPUTED_FIELD_SCALAR_TYPES)[number];
