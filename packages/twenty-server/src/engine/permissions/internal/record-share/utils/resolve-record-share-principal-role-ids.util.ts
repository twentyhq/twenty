/* @license Enterprise */

import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';

export const resolveRecordSharePrincipalRoleIds = ({
  principals,
  flatWorkspaceMemberMaps,
  userWorkspaceRoleMap,
}: {
  principals: Pick<RecordShare, 'principalType' | 'principalId'>[];
  flatWorkspaceMemberMaps: Pick<
    FlatWorkspaceMemberMaps,
    'byId' | 'userWorkspaceIdByUserId'
  >;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
}): (string | undefined)[] =>
  principals.map((principal) => {
    switch (principal.principalType) {
      case RecordSharePrincipalType.ROLE:
        return principal.principalId;
      case RecordSharePrincipalType.WORKSPACE_MEMBER: {
        const flatWorkspaceMember =
          flatWorkspaceMemberMaps.byId[principal.principalId];

        if (
          !isDefined(flatWorkspaceMember) ||
          isDefined(flatWorkspaceMember.deletedAt)
        ) {
          return undefined;
        }

        const userWorkspaceId =
          flatWorkspaceMemberMaps.userWorkspaceIdByUserId[
            flatWorkspaceMember.userId
          ];

        return isDefined(userWorkspaceId)
          ? userWorkspaceRoleMap[userWorkspaceId]
          : undefined;
      }
      default:
        return undefined;
    }
  });
