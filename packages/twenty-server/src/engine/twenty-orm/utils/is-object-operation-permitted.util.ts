import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type ObjectsPermissions } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';

// TODO: this should be improved, we may have more complex permission configuration for is system objects
const isExemptFromObjectPermissions = (
  objectMetadata: FlatObjectMetadata,
): boolean =>
  objectMetadata.isSystem === true &&
  objectMetadata.universalIdentifier !==
    STANDARD_OBJECTS.workspaceMember.universalIdentifier;

export const isObjectOperationPermitted = ({
  objectMetadata,
  operationType,
  objectsPermissions,
}: {
  objectMetadata: FlatObjectMetadata;
  operationType: OperationType;
  objectsPermissions: ObjectsPermissions;
}): boolean => {
  if (isExemptFromObjectPermissions(objectMetadata)) {
    return true;
  }

  const objectPermissions = objectsPermissions[objectMetadata.id];

  switch (operationType) {
    case 'select':
      return objectPermissions?.canReadObjectRecords === true;
    case 'insert':
    case 'update':
      return objectPermissions?.canUpdateObjectRecords === true;
    case 'delete':
      return objectPermissions?.canDestroyObjectRecords === true;
    case 'restore':
    case 'soft-delete':
      return objectPermissions?.canSoftDeleteObjectRecords === true;
    default:
      return assertUnreachable(operationType);
  }
};
