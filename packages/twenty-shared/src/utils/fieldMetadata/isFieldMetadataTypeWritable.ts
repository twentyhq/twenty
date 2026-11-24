import { FIELD_METADATA_TYPES_NOT_WRITABLE } from '@/constants';
import { type FieldMetadataType } from '@/types';

export const isFieldMetadataTypeWritable = (type: FieldMetadataType): boolean =>
  !FIELD_METADATA_TYPES_NOT_WRITABLE.has(type);
