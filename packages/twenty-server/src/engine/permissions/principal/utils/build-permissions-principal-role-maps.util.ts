/* @license Enterprise */

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type PermissionsPrincipalRoleMaps } from 'src/engine/permissions/principal/utils/resolve-permissions-principals-with-roles.util';

const EMPTY_WORKSPACE_MEMBER_MAPS = { byId: {}, userWorkspaceIdByUserId: {} };

export const buildPermissionsPrincipalRoleMaps = ({
  flatWorkspaceMemberMaps,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
  flatRoleTargetByAgentIdMaps,
  flatApplicationMaps,
}: Omit<
  PermissionsPrincipalRoleMaps,
  'flatWorkspaceMemberMaps' | 'flatRoleTargetMaps'
> & {
  flatWorkspaceMemberMaps?: FlatWorkspaceMemberMaps;
}): PermissionsPrincipalRoleMaps => ({
  flatWorkspaceMemberMaps:
    flatWorkspaceMemberMaps ?? EMPTY_WORKSPACE_MEMBER_MAPS,
  userWorkspaceRoleMap,
  apiKeyRoleMap,
  flatRoleTargetByAgentIdMaps,
  flatApplicationMaps,
});
