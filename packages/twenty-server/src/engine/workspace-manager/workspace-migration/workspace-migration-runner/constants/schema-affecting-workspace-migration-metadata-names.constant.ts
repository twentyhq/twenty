import { type AllMetadataName } from 'twenty-shared/metadata';

export const SCHEMA_AFFECTING_WORKSPACE_MIGRATION_METADATA_NAMES = [
  'objectMetadata',
  'fieldMetadata',
  'index',
] as const satisfies readonly AllMetadataName[];
