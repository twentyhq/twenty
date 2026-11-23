/* @license Enterprise */

import { canAccessThroughAllRecordsPermission } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getEnforcedOperationType } from 'src/engine/permissions/internal/role/utils/get-enforced-operation-type.util';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';

export const canAllRecordsAccessOperation = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): boolean =>
  canAccessThroughAllRecordsPermission({
    objectRecordsPermissions: getPermissionsPrincipalsRecordsPermissions({
      principals,
      metadataMaps,
    }).objects[flatObjectMetadata.id],
    operationType: getEnforcedOperationType({
      operationType,
      featureFlagsMap: metadataMaps.featureFlagsMap,
    }),
  });
