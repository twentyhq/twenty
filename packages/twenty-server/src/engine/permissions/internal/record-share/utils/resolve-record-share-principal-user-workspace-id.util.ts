/* @license Enterprise */

import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';

export const resolveRecordSharePrincipalUserWorkspaceId = ({
  principal,
  flatWorkspaceMemberMaps,
}: {
  principal: Pick<RecordShare, 'principalType' | 'principalId'>;
  flatWorkspaceMemberMaps: Pick<
    FlatWorkspaceMemberMaps,
    'byId' | 'userWorkspaceIdByUserId'
  >;
}): string | undefined => {
  if (principal.principalType !== RecordSharePrincipalType.WORKSPACE_MEMBER) {
    return undefined;
  }

  const flatWorkspaceMember =
    flatWorkspaceMemberMaps.byId[principal.principalId];

  if (
    !isDefined(flatWorkspaceMember) ||
    isDefined(flatWorkspaceMember.deletedAt)
  ) {
    return undefined;
  }

  return flatWorkspaceMemberMaps.userWorkspaceIdByUserId[
    flatWorkspaceMember.userId
  ];
};
