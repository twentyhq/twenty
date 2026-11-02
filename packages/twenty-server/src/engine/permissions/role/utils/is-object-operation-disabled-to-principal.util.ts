/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isPermissionsPrincipalOwningObject } from 'src/engine/permissions/principal/utils/is-permissions-principal-owning-object.util';
import { isObjectOperationDisabled } from 'src/engine/permissions/role/utils/is-object-operation-disabled.util';

export const isObjectOperationDisabledToPrincipal = ({
  principal,
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): boolean =>
  isObjectOperationDisabled({
    objectMetadata: flatObjectMetadata,
    operationType,
  }) &&
  !isPermissionsPrincipalOwningObject({
    principal,
    flatApplicationMaps: metadataMaps.flatApplicationMaps,
    flatObjectMetadata,
  });
