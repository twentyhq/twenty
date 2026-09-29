import { isNonEmptyString } from '@sniptt/guards';
import {
  type PermissionFlagType,
  TOOL_PERMISSION_FLAGS,
} from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRoleTargetMaps } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { flatRoleHasPermissionFlag } from 'src/engine/metadata-modules/flat-role/utils/flat-role-has-permission-flag.util';

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
  const hasBasePermission = (flatRole: FlatRole): boolean =>
    TOOL_PERMISSION_FLAGS.includes(permissionFlag)
      ? flatRole.canAccessAllTools
      : flatRole.canUpdateAllSettings;

  const flatRolesWithPermissionFlag = Object.values(
    flatRoleMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatRole) =>
        hasBasePermission(flatRole) ||
        flatRoleHasPermissionFlag({
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
