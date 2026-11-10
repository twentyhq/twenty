import { type AllMetadataName } from 'twenty-shared/metadata';

export const VIEW_FAMILY_METADATA_NAMES: ReadonlySet<AllMetadataName> =
  new Set<AllMetadataName>([
    'view',
    'viewField',
    'viewFieldGroup',
    'viewFilter',
    'viewFilterGroup',
    'viewSort',
    'viewGroup',
  ]);
