/* @license Enterprise */

import { canReachAllRecords } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/role/utils/get-permissions-principals-records-permissions.util';

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

  return canReachAllRecords({ objectRecordsPermissions, operationType });
};
