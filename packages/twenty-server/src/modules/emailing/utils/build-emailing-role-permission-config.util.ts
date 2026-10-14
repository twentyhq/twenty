import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildUserRoleIdsBySource } from 'src/engine/twenty-orm/utils/build-user-role-ids-by-source.util';

export const buildEmailingRolePermissionConfig = (
  userRoleId: string,
): RolePermissionConfig => {
  const { authContext } = getWorkspaceContext();

  return {
    intersectionOf: buildUserRoleIdsBySource({
      userRoleId,
      application: isUserAuthContext(authContext)
        ? authContext.application
        : undefined,
    }),
  };
};
