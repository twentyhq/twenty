import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { isPermissionFlagGrantedToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/is-permission-flag-granted-to-flat-role.util';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';

export const resolveAgentChatParticipantRoleId = ({
  userWorkspaceId,
  userWorkspaceRoleMap,
  flatRoleMaps,
  flatRolePermissionFlagMaps,
}: {
  userWorkspaceId: string;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  flatRoleMaps: FlatEntityMaps<FlatRole>;
  flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps;
}): string | undefined => {
  const roleId = userWorkspaceRoleMap[userWorkspaceId];

  if (!isDefined(roleId)) {
    return undefined;
  }

  const flatRole = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: roleId,
    flatEntityMaps: flatRoleMaps,
  });

  if (!isDefined(flatRole)) {
    return undefined;
  }

  return isPermissionFlagGrantedToFlatRole({
    flatRole,
    permissionFlag: PermissionFlagType.AI,
    flatRolePermissionFlagMaps,
  })
    ? roleId
    : undefined;
};
