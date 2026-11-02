/* @license Enterprise */

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';

export type PermissionsPrincipalRoleMaps = {
  flatWorkspaceMemberMaps: {
    byId: Partial<Record<string, Pick<FlatWorkspaceMember, 'userId'>>>;
    userWorkspaceIdByUserId: FlatWorkspaceMemberMaps['userWorkspaceIdByUserId'];
  };
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  flatRoleTargetByAgentIdMaps: Partial<
    Record<string, Pick<FlatRoleTarget, 'roleId'>>
  >;
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
