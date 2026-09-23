import { type FieldMetadataType } from '@/types/FieldMetadataType';

export const validationRuleNullPlaceholders = new WeakSet<object>();

export const validationRuleCompositeFieldTypeByValue = new WeakMap<
  object,
  FieldMetadataType
>();
