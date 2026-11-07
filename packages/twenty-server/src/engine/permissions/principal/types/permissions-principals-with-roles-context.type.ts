/* @license Enterprise */

import { type AiRunPermissionScope } from 'src/engine/permissions/principal/types/ai-run-permission-scope.type';
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

export type PermissionsMainPrincipalWithRole =
  | WithRoleId<PermissionsWorkspaceMemberPrincipal>
  | WithRoleId<PermissionsApiKeyPrincipal>
  | WithRoleId<PermissionsAgentPrincipal>
  | WithRoleId<PermissionsWebhookPrincipal>
  | WithRoleId<PermissionsApplicationIdPrincipal>
  | PermissionsRolePrincipal;

export type PermissionsLimitingPrincipalWithRole =
  WithRoleId<PermissionsAgentPrincipal>;

export type PermissionsApplicationPrincipalWithRole =
  | WithRoleId<PermissionsApplicationIdPrincipal>
  | PermissionsCustomApplicationPrincipal;

export type PermissionsPrincipalsWithRolesContext = {
  workspaceId: string;
  mainPrincipal: PermissionsMainPrincipalWithRole;
  limitingPrincipal?: PermissionsLimitingPrincipalWithRole;
  applicationPrincipal: PermissionsApplicationPrincipalWithRole;
  // narrows what the roles allow, and leaves no reach beyond them
  aiRunScope?: AiRunPermissionScope;
};
