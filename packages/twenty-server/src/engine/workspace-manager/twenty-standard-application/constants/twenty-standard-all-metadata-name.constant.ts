import { type AllMetadataName } from 'twenty-shared/metadata';

export const TWENTY_STANDARD_ALL_METADATA_NAME = [
  'index',
  'objectMetadata',
  'fieldMetadata',
  'viewField',
  'viewFieldGroup',
  'viewFilter',
  'viewGroup',
  'view',
  'navigationMenuItem',
  'role',
  'agent',
  'skill',
  'pageLayout',
  'pageLayoutTab',
  'pageLayoutWidget',
] as const satisfies AllMetadataName[];
