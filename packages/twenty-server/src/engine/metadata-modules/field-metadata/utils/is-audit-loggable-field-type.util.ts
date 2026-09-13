import { FieldMetadataType } from 'twenty-shared/types';

// Position values render blank in the timeline, so a position field is created
// non audit logged rather than being filtered out again at write time.
const NON_AUDIT_LOGGABLE_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.POSITION,
];

export const isAuditLoggableFieldType = (type: FieldMetadataType): boolean =>
  !NON_AUDIT_LOGGABLE_FIELD_TYPES.includes(type);
