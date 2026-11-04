/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { getPermissionsPrincipalsObjectsPermissions } from 'src/engine/permissions/role/utils/get-permissions-principals-objects-permissions.util';
import { isObjectOperationPermitted } from 'src/engine/permissions/role/utils/is-object-operation-permitted.util';

export const isRolePermittingOperation = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): boolean =>
  isObjectOperationPermitted({
    objectMetadata: flatObjectMetadata,
    operationType,
    objectsPermissions: getPermissionsPrincipalsObjectsPermissions({
      principals,
      metadataMaps,
    }),
  });
