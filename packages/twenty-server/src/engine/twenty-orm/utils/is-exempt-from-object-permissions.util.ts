import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// TODO: this should be improved, we may have more complex permission configuration for is system objects
export const isExemptFromObjectPermissions = (
  objectMetadata: FlatObjectMetadata,
): boolean =>
  objectMetadata.isSystem === true &&
  objectMetadata.universalIdentifier !==
    STANDARD_OBJECTS.workspaceMember.universalIdentifier;
