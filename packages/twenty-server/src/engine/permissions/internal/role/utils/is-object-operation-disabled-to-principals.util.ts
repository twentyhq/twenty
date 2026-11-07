/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
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
    operationType,
    isCreatePermissionEnabled:
      metadataMaps.featureFlagsMap[FeatureFlagKey.IS_CREATE_RECORDS_PERMISSION_ENABLED] ??
      false,
  }) &&
  !isPermissionsPrincipalsOwningObject({
    principals,
    flatObjectMetadata,
  });
