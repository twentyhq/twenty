/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isPermissionsPrincipalOwningObject } from 'src/engine/permissions/principal/utils/is-permissions-principal-owning-object.util';
import { isObjectOperationDisabled } from 'src/engine/permissions/role/utils/is-object-operation-disabled.util';

export const isObjectOperationDisabledToPrincipal = ({
  principal,
  flatObjectMetadata,
  operationType,
}: Omit<PermissionsObjectAccessRequest, 'metadataMaps'>): boolean =>
  isObjectOperationDisabled({
    objectMetadata: flatObjectMetadata,
    operationType,
  }) &&
  !isPermissionsPrincipalOwningObject({
    principal,
    flatObjectMetadata,
  });
