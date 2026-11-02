/* @license Enterprise */

import {
  type PermissionsAgentPrincipal,
  type PermissionsApiKeyPrincipal,
  type PermissionsApplicationIdPrincipal,
  type PermissionsCustomApplicationPrincipal,
  type PermissionsDeprecatedRoleOnlyPrincipal,
  type PermissionsWebhookPrincipal,
  type PermissionsWorkspaceMemberPrincipal,
} from 'src/engine/permissions/principal/types/permissions-principals-context.type';

type WithRoleId<TPrincipal> = TPrincipal & { roleId: string };

export type PermissionsMainPrincipalWithRole =
  | WithRoleId<PermissionsWorkspaceMemberPrincipal>
  | WithRoleId<PermissionsApiKeyPrincipal>
  | WithRoleId<PermissionsAgentPrincipal>
  | WithRoleId<PermissionsWebhookPrincipal>
  | WithRoleId<PermissionsApplicationIdPrincipal>
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsLimitingPrincipalWithRole =
  | WithRoleId<PermissionsAgentPrincipal>
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsApplicationPrincipalWithRole =
  | WithRoleId<PermissionsApplicationIdPrincipal>
  | PermissionsCustomApplicationPrincipal
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsPrincipalsWithRolesContext = {
  workspaceId: string;
  mainPrincipal: PermissionsMainPrincipalWithRole;
  limitingPrincipal?: PermissionsLimitingPrincipalWithRole;
  applicationPrincipal: PermissionsApplicationPrincipalWithRole;
};
