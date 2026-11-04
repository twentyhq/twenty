/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { canReachSomeRecords } from 'src/engine/permissions/role/utils/can-reach-some-records.util';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/role/utils/get-permissions-principals-records-permissions.util';

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
    operationType,
  });
