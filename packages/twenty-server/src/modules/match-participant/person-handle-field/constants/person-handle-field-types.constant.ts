import { FieldMetadataType } from 'twenty-shared/types';

export const PERSON_HANDLE_FIELD_TYPES = [
  FieldMetadataType.EMAILS,
  FieldMetadataType.PHONES,
  FieldMetadataType.LINKS,
  FieldMetadataType.TEXT,
] as const;
