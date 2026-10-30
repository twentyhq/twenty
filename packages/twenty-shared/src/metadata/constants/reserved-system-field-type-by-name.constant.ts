import { FieldMetadataType } from '@/types/FieldMetadataType';

export const RESERVED_SYSTEM_FIELD_TYPE_BY_NAME = {
  id: FieldMetadataType.UUID,
  createdAt: FieldMetadataType.DATE_TIME,
  updatedAt: FieldMetadataType.DATE_TIME,
  deletedAt: FieldMetadataType.DATE_TIME,
  createdBy: FieldMetadataType.ACTOR,
  updatedBy: FieldMetadataType.ACTOR,
  position: FieldMetadataType.POSITION,
} as const;
