/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getEnforcedOperationType } from 'src/engine/permissions/internal/role/utils/get-enforced-operation-type.util';
import { isPermissionsPrincipalsOwningObject } from 'src/engine/permissions/internal/principal/utils/is-permissions-principals-owning-object.util';
import { isObjectOperationDisabled } from 'src/engine/permissions/internal/role/utils/is-object-operation-disabled.util';

export const isObjectOperationDisabledToPrincipals = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): boolean =>
  isObjectOperationDisabled({
    objectMetadata: flatObjectMetadata,
    operationType: getEnforcedOperationType({
      operationType,
      featureFlagsMap: metadataMaps.featureFlagsMap,
    }),
  }) &&
  !isPermissionsPrincipalsOwningObject({
    principals,
    flatObjectMetadata,
  });
