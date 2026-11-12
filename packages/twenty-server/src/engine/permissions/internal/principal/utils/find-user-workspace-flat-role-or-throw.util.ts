/* @license Enterprise */

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';

export const findUserWorkspaceFlatRoleOrThrow = ({
  userWorkspaceId,
  userWorkspaceRoleMap,
  flatRoleMaps,
}: {
  userWorkspaceId: string;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  flatRoleMaps: FlatRoleMaps;
}): FlatRole => {
  const roleId = userWorkspaceRoleMap[userWorkspaceId];

  const flatRole = isDefined(roleId)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: roleId,
        flatEntityMaps: flatRoleMaps,
      })
    : undefined;

  if (!isDefined(flatRole)) {
    throw new PermissionsException(
      PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      {
        userFriendlyMessage: msg`Your role in this workspace could not be found. Please contact your workspace administrator.`,
      },
    );
  }

  return flatRole;
};
