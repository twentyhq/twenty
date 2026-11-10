/* @license Enterprise */

import { canReachAllRecords } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { getPermissionsPrincipalsLimitingRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-limiting-role-ids.util';
import { getEnforcedOperationType } from 'src/engine/permissions/internal/role/utils/get-enforced-operation-type.util';

export const areLimitingRolesReachingAllRecords = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): boolean =>
  getPermissionsPrincipalsLimitingRoleIds(principals).every((limitingRoleId) =>
    canReachAllRecords({
      objectRecordsPermissions:
        metadataMaps.rolesPermissions[limitingRoleId]?.objects[
          flatObjectMetadata.id
        ],
      operationType: getEnforcedOperationType({
        operationType,
        featureFlagsMap: metadataMaps.featureFlagsMap,
      }),
    }),
  );
