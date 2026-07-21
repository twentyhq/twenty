import { IMAGE_IDENTIFIER_FIELD_METADATA_TYPES } from '@/constants/ImageIdentifierFieldMetadataTypes';
import { type FieldMetadataType } from '@/types';

export const isImageIdentifierFieldMetadataType = (
  value: FieldMetadataType,
): value is (typeof IMAGE_IDENTIFIER_FIELD_METADATA_TYPES)[number] =>
  IMAGE_IDENTIFIER_FIELD_METADATA_TYPES.includes(value);
