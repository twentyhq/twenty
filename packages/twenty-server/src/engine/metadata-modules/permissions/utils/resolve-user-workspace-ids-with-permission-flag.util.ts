import { isNonEmptyString } from '@sniptt/guards';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRoleTargetMaps } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isPermissionFlagGrantedToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/is-permission-flag-granted-to-flat-role.util';

export const resolveUserWorkspaceIdsWithPermissionFlag = ({
  permissionFlag,
  flatRoleMaps,
  flatRolePermissionFlagMaps,
  flatRoleTargetMaps,
}: {
  permissionFlag: PermissionFlagType;
  flatRoleMaps: FlatRoleMaps;
  flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps;
  flatRoleTargetMaps: FlatRoleTargetMaps;
}): string[] => {
  const flatRolesWithPermissionFlag = Object.values(
    flatRoleMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((flatRole) =>
      isPermissionFlagGrantedToFlatRole({
        flatRole,
        permissionFlag,
        flatRolePermissionFlagMaps,
      }),
    );

  const userWorkspaceIds = new Set<string>();

  for (const flatRole of flatRolesWithPermissionFlag) {
    for (const roleTargetId of flatRole.roleTargetIds) {
      const flatRoleTarget = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: roleTargetId,
        flatEntityMaps: flatRoleTargetMaps,
      });

      if (
        isDefined(flatRoleTarget) &&
        isNonEmptyString(flatRoleTarget.userWorkspaceId)
      ) {
        userWorkspaceIds.add(flatRoleTarget.userWorkspaceId);
      }
    }
  }

  return [...userWorkspaceIds];
};
