import { type AllMetadataName } from 'twenty-shared/metadata';

export const TWENTY_STANDARD_ALL_METADATA_NAME = [
  'index',
  'searchFieldMetadata',
  'objectMetadata',
  'fieldMetadata',
  'viewField',
  'viewFieldGroup',
  'viewFilter',
  'viewGroup',
  'view',
  'navigationMenuItem',
  'permissionFlag',
  'role',
  'agent',
  'skill',
  'pageLayout',
  'pageLayoutTab',
  'pageLayoutWidget',
  'commandMenuItem',
] as const satisfies AllMetadataName[];
