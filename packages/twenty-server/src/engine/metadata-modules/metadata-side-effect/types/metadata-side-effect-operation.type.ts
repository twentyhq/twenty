import { type AllMetadataName } from 'twenty-shared/metadata';

// The intention that triggers a side-effect handler, mirroring the create/update/delete
// lists of the operation matrix (FlatEntityToCreateDeleteUpdate).
export type MetadataSideEffectOperation = 'create' | 'update' | 'delete';

export const METADATA_SIDE_EFFECT_OPERATIONS = [
  'create',
  'update',
  'delete',
] as const satisfies readonly MetadataSideEffectOperation[];

export type MetadataSideEffectHandlerKey =
  `${MetadataSideEffectOperation}:${AllMetadataName}`;

export const buildMetadataSideEffectHandlerKey = (
  operation: MetadataSideEffectOperation,
  metadataName: AllMetadataName,
): MetadataSideEffectHandlerKey => `${operation}:${metadataName}`;
