import { type AllMetadataName } from 'twenty-shared/metadata';

export const TWENTY_STANDARD_ALL_METADATA_NAME = [
  'index',
  'objectMetadata',
  'fieldMetadata',
  'viewField',
  'viewFilter',
  'viewGroup',
  'view',
  'role',
  'agent',
  'skill',
] as const satisfies AllMetadataName[];
