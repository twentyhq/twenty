import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { flatRoleHasPermissionFlag } from 'src/engine/metadata-modules/flat-role/utils/flat-role-has-permission-flag.util';

export const findFlatRoleForToolOrThrow = ({
  roleId,
  flatRoleMaps,
}: {
  roleId: string;
  flatRoleMaps: FlatEntityMaps<FlatRole>;
}): FlatRole => {
  const flatRole = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: roleId,
    flatEntityMaps: flatRoleMaps,
  });

  if (!isDefined(flatRole)) {
    throw new Error(
      `Role with id "${roleId}" not found. Use list_roles to see available roles.`,
    );
  }

  return flatRole;
};

export const getFlatRoleForToolOrThrow = async ({
  roleId,
  workspaceId,
  flatEntityMapsCacheService,
}: {
  roleId: string;
  workspaceId: string;
  flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;
}): Promise<FlatRole> => {
  const { flatRoleMaps } =
    await flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
      workspaceId,
      flatMapsKeys: ['flatRoleMaps'],
    });

  return findFlatRoleForToolOrThrow({ roleId, flatRoleMaps });
};

// The migration validators reject non-editable roles too; checking here first
// gives the model a named, actionable message instead of a build failure report.
export const assertRoleIsEditable = (flatRole: FlatRole): void => {
  if (!flatRole.isEditable) {
    throw new Error(
      `Role "${flatRole.label}" is system-managed (like the Admin role) and cannot be modified or deleted.`,
    );
  }
};

export const assertRoleDeletionDoesNotLockOutCaller = ({
  flatRole,
  callerRoleIds,
}: {
  flatRole: FlatRole;
  callerRoleIds: string[];
}): void => {
  if (callerRoleIds.includes(flatRole.id)) {
    throw new Error(
      `Role "${flatRole.label}" is the role you are currently acting under. Deleting it would reassign you to the workspace default role and could lock you out of role management. Ask another administrator to delete it.`,
    );
  }
};

// Removing settings access from a role the caller acts under would lock them
// out of role management, unless the role keeps an explicit ROLES permission flag.
export const assertRoleUpdateDoesNotLockOutCaller = ({
  flatRole,
  canUpdateAllSettingsUpdate,
  callerRoleIds,
  flatRolePermissionFlagMaps,
}: {
  flatRole: FlatRole;
  canUpdateAllSettingsUpdate: boolean | undefined;
  callerRoleIds: string[];
  flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps;
}): void => {
  if (!callerRoleIds.includes(flatRole.id)) {
    return;
  }

  if (canUpdateAllSettingsUpdate !== false || !flatRole.canUpdateAllSettings) {
    return;
  }

  const hasExplicitRolesPermissionFlag = flatRoleHasPermissionFlag({
    flatRole,
    permissionFlag: PermissionFlagType.ROLES,
    flatRolePermissionFlagMaps,
  });

  if (!hasExplicitRolesPermissionFlag) {
    throw new Error(
      `This update would remove settings access from role "${flatRole.label}", which you are currently acting under, and would lock you out of role management. Ask another administrator to make this change.`,
    );
  }
};
