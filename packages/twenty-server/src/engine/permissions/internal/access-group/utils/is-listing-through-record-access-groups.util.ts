/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { areRecordAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/are-record-access-groups-enabled.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';

// Groups only cover the main role, so a rule on a limiting or application role keeps the live condition
export const isListingThroughRecordAccessGroups = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): boolean => {
  const roleIdsWithRule = getPermissionsPrincipalsRoleIds(principals).filter(
    (roleId) =>
      isDefined(
        metadataMaps.rolesPermissions[roleId]?.objects[flatObjectMetadata.id]
          ?.rowLevelRecordsPermissions,
      ),
  );

  return (
    operationType === 'read' &&
    areRecordAccessGroupsEnabled({
      featureFlagsMap: metadataMaps.featureFlagsMap,
    }) &&
    roleIdsWithRule.length === 1 &&
    roleIdsWithRule[0] === principals.mainPrincipal.roleId
  );
};
