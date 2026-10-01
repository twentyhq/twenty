import { FieldMetadataType } from 'twenty-shared/types';

// position values render blank in the timeline
const NON_AUDIT_LOGGABLE_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.POSITION,
];

export const isAuditLoggableFieldType = (type: FieldMetadataType): boolean =>
  !NON_AUDIT_LOGGABLE_FIELD_TYPES.includes(type);
