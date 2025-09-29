import { type COMPOSITE_FIELD_TYPE_SUB_FIELDS } from '@/constants/CompositeFieldTypeSubFields';

export type CompositeFieldSubFieldName = typeof COMPOSITE_FIELD_TYPE_SUB_FIELDS[keyof typeof COMPOSITE_FIELD_TYPE_SUB_FIELDS][number];