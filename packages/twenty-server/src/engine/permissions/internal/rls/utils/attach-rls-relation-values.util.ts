/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RlsWorkspaceMemberRelationValueMaps } from 'src/engine/permissions/internal/rls/types/rls-workspace-member-relation-value-maps.type';
import { type RlsWorkspaceMember } from 'src/engine/permissions/internal/rls/types/rls-workspace-member.type';

export const attachRlsRelationValues = ({
  workspaceMember,
  rlsWorkspaceMemberRelationValueMaps,
}: {
  workspaceMember: RlsWorkspaceMember;
  rlsWorkspaceMemberRelationValueMaps:
    | RlsWorkspaceMemberRelationValueMaps
    | undefined;
}): RlsWorkspaceMember =>
  isDefined(rlsWorkspaceMemberRelationValueMaps)
    ? {
        ...workspaceMember,
        rlsRelationValuesByMemberFieldKey:
          rlsWorkspaceMemberRelationValueMaps.byWorkspaceMemberId[
            workspaceMember.id
          ] ?? {},
      }
    : workspaceMember;
