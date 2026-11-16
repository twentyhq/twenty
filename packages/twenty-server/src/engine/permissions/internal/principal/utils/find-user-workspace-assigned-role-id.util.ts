/* @license Enterprise */

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';

export const findUserWorkspaceAssignedRoleId = ({
  userWorkspaceId,
  userWorkspaceRoleMap,
  flatRoleMaps,
}: {
  userWorkspaceId: string;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  flatRoleMaps: FlatRoleMaps;
}): string | undefined =>
  userWorkspaceRoleMap[userWorkspaceId]?.find(
    (roleId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: roleId,
        flatEntityMaps: flatRoleMaps,
      })?.isSystemSideEffect !== true,
  );
