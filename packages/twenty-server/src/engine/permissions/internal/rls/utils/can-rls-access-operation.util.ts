/* @license Enterprise */

import { canReachAllRecords, canReachSomeRecords } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { getEnforcedOperationType } from 'src/engine/permissions/internal/role/utils/get-enforced-operation-type.util';
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
  const enforcedOperationType = getEnforcedOperationType({
    operationType,
    featureFlagsMap: metadataMaps.featureFlagsMap,
  });

  return (
    !canReachAllRecords({
      objectRecordsPermissions,
      operationType: enforcedOperationType,
    }) &&
    canReachSomeRecords({
      objectRecordsPermissions,
      operationType: enforcedOperationType,
    })
  );
};
