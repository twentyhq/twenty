import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildAgentRoleIdsBySource } from 'src/engine/twenty-orm/utils/build-agent-role-ids-by-source.util';
import { buildUserRoleIdsBySource } from 'src/engine/twenty-orm/utils/build-user-role-ids-by-source.util';
import { resolveAgentRoleId } from 'src/engine/twenty-orm/utils/resolve-agent-role-id.util';

export const buildEmailingRolePermissionConfig = (
  userRoleId: string,
): RolePermissionConfig => {
  const { authContext, flatRoleTargetByAgentIdMaps } = getWorkspaceContext();
  const userAuthContext = isUserAuthContext(authContext)
    ? authContext
    : undefined;

  return {
    intersectionOf: {
      ...buildUserRoleIdsBySource({
        userRoleId,
        application: userAuthContext?.application,
      }),
      ...buildAgentRoleIdsBySource(
        resolveAgentRoleId({
          agentId: userAuthContext?.agentId,
          flatRoleTargetByAgentIdMaps,
        }),
      ),
    },
  };
};
