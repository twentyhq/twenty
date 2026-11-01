/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { getPermissionsPrincipalObjectsPermissions } from 'src/engine/permissions/role/utils/get-permissions-principal-objects-permissions.util';
import { isObjectOperationPermitted } from 'src/engine/permissions/role/utils/is-object-operation-permitted.util';

export const isRolePermittingOperation = ({
  principal,
  environment,
  flatObjectMetadata,
  operationType,
}: Pick<
  PermissionsRowAccessRequest,
  'principal' | 'environment' | 'flatObjectMetadata' | 'operationType'
>): boolean =>
  isObjectOperationPermitted({
    objectMetadata: flatObjectMetadata,
    operationType,
    objectsPermissions: getPermissionsPrincipalObjectsPermissions({
      principal,
      environment,
    }),
  });
