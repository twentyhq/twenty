/* @license Enterprise */

import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import {
  type RoleIdsBySource,
  type RolePermissionConfig,
} from 'src/engine/permissions/principal/types/role-permission-config.type';

export const buildPermissionsPrincipalRoles = ({
  roleIdsBySource,
  workspaceMemberId,
}: {
  roleIdsBySource: RoleIdsBySource;
  workspaceMemberId: string | undefined;
}): Omit<PermissionsPrincipal, 'workspaceId'> => {
  const {
    userWorkspaceRoleId,
    apiKeyRoleId,
    webhookRoleId,
    agentRoleId,
    applicationRoleId,
  } = roleIdsBySource;

  const mainRoleId = [userWorkspaceRoleId, apiKeyRoleId, webhookRoleId].find(
    (roleId) => roleId !== undefined,
  );

  return {
    main:
      mainRoleId !== undefined
        ? { roleId: mainRoleId, workspaceMemberId }
        : undefined,
    limitingRoleId: agentRoleId,
    appRoleId: applicationRoleId,
  };
};

// undefined when the config bypasses permission checks
export const buildPermissionsPrincipal = ({
  workspaceId,
  rolePermissionConfig,
  workspaceMemberId,
}: {
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
  workspaceMemberId: string | undefined;
}): PermissionsPrincipal | undefined =>
  'intersectionOf' in rolePermissionConfig
    ? {
        workspaceId,
        ...buildPermissionsPrincipalRoles({
          roleIdsBySource: rolePermissionConfig.intersectionOf,
          workspaceMemberId,
        }),
      }
    : undefined;
