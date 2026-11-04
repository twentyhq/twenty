/* @license Enterprise */

import {
  type ObjectRecordsOperationType,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/role/utils/get-permissions-principals-records-permissions.util';

const isOperationGrantedOnAllRecords = ({
  objectRecordsPermissions,
  operationType,
}: {
  objectRecordsPermissions: ObjectRecordsPermissions;
  operationType: ObjectRecordsOperationType;
}): boolean => {
  switch (operationType) {
    case 'select':
      return objectRecordsPermissions.canReadAllRecords;
    case 'insert':
    case 'update':
      return objectRecordsPermissions.canUpdateAllRecords;
    case 'delete':
      return objectRecordsPermissions.canDestroyAllRecords;
    case 'restore':
    case 'soft-delete':
      return objectRecordsPermissions.canSoftDeleteAllRecords;
    default:
      return assertUnreachable(operationType);
  }
};

export const isRoleGrantingOperationOnAllRecords = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): boolean => {
  const objectRecordsPermissions = getPermissionsPrincipalsRecordsPermissions({
    principals,
    metadataMaps,
  }).objects[flatObjectMetadata.id];

  return (
    isDefined(objectRecordsPermissions) &&
    isOperationGrantedOnAllRecords({ objectRecordsPermissions, operationType })
  );
};
