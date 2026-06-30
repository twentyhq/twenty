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

// Self-describing metadata attached to every side-effect handler. Several handlers can be
// registered for the same (operation, metadataName) trigger; `name` and `description` make each
// registered side effect explicit (what it does and the product goal it serves).
export type MetadataSideEffectHandlerDescriptor = {
  operation: MetadataSideEffectOperation;
  metadataName: AllMetadataName;
  name: string;
  description: string;
};
