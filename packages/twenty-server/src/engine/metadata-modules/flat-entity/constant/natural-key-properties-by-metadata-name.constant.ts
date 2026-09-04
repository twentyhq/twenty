import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';

export const NATURAL_KEY_PROPERTIES_BY_METADATA_NAME: Partial<{
  [P in AllMetadataName]: MetadataUniversalFlatEntityPropertiesToCompare<P>[];
}> = {
  objectPermission: [
    'roleUniversalIdentifier',
    'objectMetadataUniversalIdentifier',
  ],
  fieldPermission: [
    'roleUniversalIdentifier',
    'objectMetadataUniversalIdentifier',
    'fieldMetadataUniversalIdentifier',
  ],
  rolePermissionFlag: [
    'roleUniversalIdentifier',
    'permissionFlagUniversalIdentifier',
  ],
};
