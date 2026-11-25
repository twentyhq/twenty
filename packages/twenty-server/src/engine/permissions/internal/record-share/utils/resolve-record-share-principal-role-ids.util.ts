/* @license Enterprise */

import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { resolveRecordSharePrincipalUserWorkspaceId } from 'src/engine/permissions/internal/record-share/utils/resolve-record-share-principal-user-workspace-id.util';
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
}): string[][] =>
  principals.map((principal) => {
    if (principal.principalType === RecordSharePrincipalType.ROLE) {
      return [principal.principalId];
    }

    const userWorkspaceId = resolveRecordSharePrincipalUserWorkspaceId({
      principal,
      flatWorkspaceMemberMaps,
    });

    return isDefined(userWorkspaceId)
      ? (userWorkspaceRoleMap[userWorkspaceId] ?? [])
      : [];
  });
