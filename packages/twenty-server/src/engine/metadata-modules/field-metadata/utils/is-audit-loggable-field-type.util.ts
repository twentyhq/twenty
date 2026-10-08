import { FieldMetadataType } from 'twenty-shared/types';

// position values render blank in the timeline, so these fields are created non audit logged instead of filtered at write time
const NON_AUDIT_LOGGABLE_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.POSITION,
];

export const isAuditLoggableFieldType = (type: FieldMetadataType): boolean =>
  !NON_AUDIT_LOGGABLE_FIELD_TYPES.includes(type);
