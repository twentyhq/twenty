import { COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES } from '@/constants/CompositeFieldTypeSubFieldsNames';

const _allSubFieldValues = Object.values(
  COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES,
).flatMap((obj) => Object.values(obj));

export type CompositeFieldSubFieldName = (typeof _allSubFieldValues)[number];
