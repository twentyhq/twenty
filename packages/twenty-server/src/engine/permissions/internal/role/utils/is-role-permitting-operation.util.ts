/* @license Enterprise */

import { canReachSomeRecords } from 'twenty-shared/utils';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { getEnforcedOperationType } from 'src/engine/permissions/internal/role/utils/get-enforced-operation-type.util';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';

export const isRolePermittingOperation = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): boolean =>
  canReachSomeRecords({
    objectRecordsPermissions: getPermissionsPrincipalsRecordsPermissions({
      principals,
      metadataMaps,
    }).objects[flatObjectMetadata.id],
    operationType: getEnforcedOperationType({
      operationType,
      featureFlagsMap: metadataMaps.featureFlagsMap,
    }),
  });
