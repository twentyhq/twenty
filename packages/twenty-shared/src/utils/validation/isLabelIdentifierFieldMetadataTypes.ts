import { LABEL_IDENTIFIER_FIELD_METADATA_TYPES } from '@/constants/LabelIdentifierFieldMetadataTypes';
import { type FieldMetadataType } from '@/types';

export const isLabelIdentifierFieldMetadataTypes = (
  value: FieldMetadataType,
): value is (typeof LABEL_IDENTIFIER_FIELD_METADATA_TYPES)[number] =>
  LABEL_IDENTIFIER_FIELD_METADATA_TYPES.includes(value);
