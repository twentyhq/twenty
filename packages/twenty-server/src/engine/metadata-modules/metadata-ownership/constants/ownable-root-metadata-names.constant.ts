import { type AllMetadataName } from 'twenty-shared/metadata';

export const OWNABLE_ROOT_METADATA_NAMES = [
  'view',
  'workflow',
] as const satisfies readonly AllMetadataName[];
