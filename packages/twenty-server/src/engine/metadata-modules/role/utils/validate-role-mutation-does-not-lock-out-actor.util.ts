import { PermissionFlagType } from 'twenty-shared/constants';

import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { flatRoleHasPermissionFlag } from 'src/engine/metadata-modules/flat-role/utils/flat-role-has-permission-flag.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

export const validateRoleDeletionDoesNotLockOutActorOrThrow = ({
  flatRole,
  actingRoleIds,
}: {
  flatRole: FlatRole;
  actingRoleIds: string[] | undefined;
}): void => {
  if (!actingRoleIds?.includes(flatRole.id)) {
    return;
  }

  throw new PermissionsException(
    PermissionsExceptionMessage.CANNOT_DELETE_OWN_ROLE,
    PermissionsExceptionCode.CANNOT_DELETE_OWN_ROLE,
  );
};

// Revoking settings access from a role the actor holds would lock them out of
// role management, unless the role keeps an explicit ROLES permission flag.
export const validateRoleUpdateDoesNotLockOutActorOrThrow = ({
  flatRole,
  canUpdateAllSettingsUpdate,
  actingRoleIds,
  flatRolePermissionFlagMaps,
}: {
  flatRole: FlatRole;
  canUpdateAllSettingsUpdate: boolean | undefined;
  actingRoleIds: string[] | undefined;
  flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps;
}): void => {
  if (!actingRoleIds?.includes(flatRole.id)) {
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
    throw new PermissionsException(
      PermissionsExceptionMessage.CANNOT_REVOKE_OWN_SETTINGS_ACCESS,
      PermissionsExceptionCode.CANNOT_REVOKE_OWN_SETTINGS_ACCESS,
    );
  }
};
