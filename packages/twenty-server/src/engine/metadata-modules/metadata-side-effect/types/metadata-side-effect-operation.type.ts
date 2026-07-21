import { type AllMetadataName } from 'twenty-shared/metadata';

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

export type MetadataSideEffectHandlerDescriptor = {
  operation: MetadataSideEffectOperation;
  metadataName: AllMetadataName;
  name: string;
  description: string;
};
