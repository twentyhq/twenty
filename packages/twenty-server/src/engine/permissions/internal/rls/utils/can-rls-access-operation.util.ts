/* @license Enterprise */

import {
  canAccessThroughAllRecordsPermission,
  canAccessThroughRlsPermission,
} from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';

export const canRlsAccessOperation = ({
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
    !canAccessThroughAllRecordsPermission({
      objectRecordsPermissions,
      operationType,
    }) &&
    canAccessThroughRlsPermission({
      rowLevelRecordsPermissions:
        objectRecordsPermissions?.rowLevelRecordsPermissions,
      operationType,
    })
  );
};
