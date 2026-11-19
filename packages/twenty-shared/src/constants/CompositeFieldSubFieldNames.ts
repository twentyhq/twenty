import { COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES } from '@/constants/CompositeFieldTypeSubFieldsNames';
import { type CompositeFieldSubFieldName } from '@/types/CompositeFieldSubFieldNameType';

export const COMPOSITE_FIELD_SUB_FIELD_NAMES: CompositeFieldSubFieldName[] = [
  ...new Set(
    Object.values(COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES).flatMap(
      (subFieldNames) => Object.values(subFieldNames),
    ),
  ),
];
