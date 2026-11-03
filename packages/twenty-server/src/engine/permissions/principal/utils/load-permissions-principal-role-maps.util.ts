/* @license Enterprise */

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildPermissionsPrincipalRoleMaps } from 'src/engine/permissions/principal/utils/build-permissions-principal-role-maps.util';
import { type PermissionsPrincipalRoleMaps } from 'src/engine/permissions/principal/utils/resolve-permissions-principals-with-roles.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const loadFlatWorkspaceMemberMaps = async ({
  workspaceCacheService,
  authContext,
}: {
  workspaceCacheService: WorkspaceCacheService;
  authContext: Pick<WorkspaceAuthContext, 'type' | 'workspace'>;
}) => {
  if (authContext.type !== 'user') {
    return undefined;
  }

  const { flatWorkspaceMemberMaps } =
    await workspaceCacheService.getOrRecompute(authContext.workspace.id, [
      'flatWorkspaceMemberMaps',
    ]);

  return flatWorkspaceMemberMaps;
};

const loadFlatRoleTargetMaps = async ({
  workspaceCacheService,
  authContext,
}: {
  workspaceCacheService: WorkspaceCacheService;
  authContext: Pick<WorkspaceAuthContext, 'type' | 'workspace'>;
}) => {
  if (authContext.type !== 'webhook') {
    return undefined;
  }

  const { flatRoleTargetMaps } = await workspaceCacheService.getOrRecompute(
    authContext.workspace.id,
    ['flatRoleTargetMaps'],
  );

  return flatRoleTargetMaps;
};

export const loadPermissionsPrincipalRoleMaps = async ({
  workspaceCacheService,
  authContext,
}: {
  workspaceCacheService: WorkspaceCacheService;
  authContext: Pick<WorkspaceAuthContext, 'type' | 'workspace'>;
}): Promise<PermissionsPrincipalRoleMaps> => {
  const {
    userWorkspaceRoleMap,
    apiKeyRoleMap,
    flatRoleTargetByAgentIdMaps,
    flatApplicationMaps,
  } = await workspaceCacheService.getOrRecompute(authContext.workspace.id, [
    'userWorkspaceRoleMap',
    'apiKeyRoleMap',
    'flatRoleTargetByAgentIdMaps',
    'flatApplicationMaps',
  ]);
  const flatWorkspaceMemberMaps = await loadFlatWorkspaceMemberMaps({
    workspaceCacheService,
    authContext,
  });
  const flatRoleTargetMaps = await loadFlatRoleTargetMaps({
    workspaceCacheService,
    authContext,
  });

  return {
    ...buildPermissionsPrincipalRoleMaps({
      flatWorkspaceMemberMaps,
      userWorkspaceRoleMap,
      apiKeyRoleMap,
      flatRoleTargetByAgentIdMaps,
      flatApplicationMaps,
    }),
    flatRoleTargetMaps,
  };
};
