import { type COMPUTED_FIELD_VALUE_TYPES } from '@/constants/ComputedFieldValueTypes';

export type ComputedFieldValueType =
  (typeof COMPUTED_FIELD_VALUE_TYPES)[number];
