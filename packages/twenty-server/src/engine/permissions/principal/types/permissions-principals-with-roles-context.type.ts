/* @license Enterprise */

import { type PermissionsDeprecatedRoleOnlyPrincipal } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

export type PermissionsMainPrincipalWithRole =
  | { roleId: string; workspaceMemberId: string }
  | { roleId: string; apiKeyId: string }
  | { roleId: string; agentId: string }
  | { roleId: string; webhookId: string }
  | { roleId: string; applicationId: string }
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsLimitingPrincipalWithRole =
  | { roleId: string; agentId: string }
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsApplicationPrincipalWithRole =
  | { roleId: string; applicationId: string }
  | { isCustomApp: true }
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsPrincipalsWithRolesContext = {
  workspaceId: string;
  mainPrincipal: PermissionsMainPrincipalWithRole;
  limitingPrincipal?: PermissionsLimitingPrincipalWithRole;
  applicationPrincipal: PermissionsApplicationPrincipalWithRole;
};
