/* @license Enterprise */

import {
  canAccessThroughAllRecordsPermission,
  isDefined,
} from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getPermissionsPrincipalsLimitingRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-limiting-role-ids.util';

export const areLimitingRolesAccessingAllRecords = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): boolean => {
  const limitingObjectRecordsPermissions = [
    ...getPermissionsPrincipalsLimitingRoleIds(principals).map(
      (limitingRoleId) =>
        metadataMaps.rolesPermissions[limitingRoleId]?.objects[
          flatObjectMetadata.id
        ],
    ),
    ...(isDefined(principals.runtimeLimitingRole)
      ? [
          principals.runtimeLimitingRole.recordsPermissions.objects[
            flatObjectMetadata.id
          ],
        ]
      : []),
  ];

  return limitingObjectRecordsPermissions.every((objectRecordsPermissions) =>
    canAccessThroughAllRecordsPermission({
      objectRecordsPermissions,
      operationType,
    }),
  );
};
