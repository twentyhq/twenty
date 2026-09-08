import { FieldMetadataType } from 'twenty-shared/types';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

// Position changes reach the other event consumers (SSE, webhooks, workflows)
// but render blank in the timeline, so they stay out of it whatever the field
// declares.
const NEVER_AUDIT_LOGGED_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.POSITION,
];

export const isFlatFieldMetadataAuditLogged = (
  flatFieldMetadata: Pick<OrmFlatFieldMetadata, 'type' | 'isAuditLogged'>,
): boolean =>
  flatFieldMetadata.isAuditLogged &&
  !NEVER_AUDIT_LOGGED_FIELD_TYPES.includes(flatFieldMetadata.type);
