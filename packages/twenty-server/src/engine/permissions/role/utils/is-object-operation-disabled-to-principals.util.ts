/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isPermissionsPrincipalsOwningObject } from 'src/engine/permissions/principal/utils/is-permissions-principals-owning-object.util';
import { isObjectOperationDisabled } from 'src/engine/permissions/role/utils/is-object-operation-disabled.util';

export const isObjectOperationDisabledToPrincipals = ({
  principals,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): boolean =>
  isObjectOperationDisabled({
    objectMetadata: flatObjectMetadata,
    operationType,
  }) &&
  !isPermissionsPrincipalsOwningObject({
    principals,
    flatObjectMetadata,
  });
