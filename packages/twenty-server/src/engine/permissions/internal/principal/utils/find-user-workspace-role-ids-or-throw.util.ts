/* @license Enterprise */

import { msg } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';

export const findUserWorkspaceRoleIdsOrThrow = ({
  userWorkspaceId,
  userWorkspaceRoleMap,
}: {
  userWorkspaceId: string;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
}): string[] => {
  const roleIds = userWorkspaceRoleMap[userWorkspaceId];

  if (!isNonEmptyArray(roleIds)) {
    throw new PermissionsException(
      PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      {
        userFriendlyMessage: msg`Your role in this workspace could not be found. Please contact your workspace administrator.`,
      },
    );
  }

  return roleIds;
};
