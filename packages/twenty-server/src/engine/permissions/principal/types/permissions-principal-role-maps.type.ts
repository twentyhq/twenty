/* @license Enterprise */

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';

export type PermissionsPrincipalRoleMaps = {
  flatWorkspaceMemberMaps: Pick<
    FlatWorkspaceMemberMaps,
    'byId' | 'userWorkspaceIdByUserId'
  >;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
  flatApplicationMaps: {
    byId: Partial<
      Record<
        string,
        Pick<
          FlatApplication,
          'id' | 'defaultRoleId' | 'sourceType' | 'deletedAt'
        >
      >
    >;
  };
  // Only webhook principals read it, so callers without one may leave it out
  flatRoleTargetMaps?: AllFlatEntityMaps['flatRoleTargetMaps'];
};
