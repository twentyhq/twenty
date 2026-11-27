/* @license Enterprise */

import { type RuntimeLimitingRole } from 'src/engine/permissions/principal/types/runtime-limiting-role.type';
import {
  type PermissionsAgentPrincipal,
  type PermissionsApiKeyPrincipal,
  type PermissionsApplicationIdPrincipal,
  type PermissionsCustomApplicationPrincipal,
  type PermissionsRolePrincipal,
  type PermissionsWebhookPrincipal,
  type PermissionsWorkspaceMemberPrincipal,
} from 'src/engine/permissions/internal/principal/types/permissions-principal.type';

type WithRoleId<TPrincipal> = TPrincipal & { roleId: string };

type WithRoleIds<TPrincipal> = TPrincipal & { roleIds: string[] };

export type PermissionsMainPrincipalWithRole = WithRoleIds<
  | PermissionsWorkspaceMemberPrincipal
  | PermissionsApiKeyPrincipal
  | PermissionsAgentPrincipal
  | PermissionsWebhookPrincipal
  | PermissionsApplicationIdPrincipal
  | PermissionsRolePrincipal
>;

export type PermissionsLimitingPrincipalWithRole =
  WithRoleId<PermissionsAgentPrincipal>;

// an OAuth-only application without a role of its own has no roleId and adds no limit
export type PermissionsApplicationPrincipalWithRole =
  | (PermissionsApplicationIdPrincipal & { roleId?: string })
  | PermissionsCustomApplicationPrincipal;

export type PermissionsPrincipalsWithRolesContext = {
  workspaceId: string;
  mainPrincipal: PermissionsMainPrincipalWithRole;
  limitingPrincipal?: PermissionsLimitingPrincipalWithRole;
  applicationPrincipal: PermissionsApplicationPrincipalWithRole;
  // narrows what the roles allow, and leaves no reach beyond them
  runtimeLimitingRole?: RuntimeLimitingRole;
};
