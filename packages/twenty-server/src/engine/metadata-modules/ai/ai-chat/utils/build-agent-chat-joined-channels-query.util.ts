import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';

// The channels a member is in: the ones they joined or were added to, and
// the ones open to their role. Only a membership row has a sidebar position
// and can be left, so a channel reached only through the role comes last
export const buildAgentChatJoinedChannelsQuery = ({
  workspaceId,
  workspaceMemberIdParameter,
  roleIdParameter,
}: {
  workspaceId: string;
  workspaceMemberIdParameter: string;
  roleIdParameter: string;
}): string => {
  const { memberTable, recordShareTable } =
    getAgentChatChannelTables(workspaceId);

  return `SELECT membership."channelId", membership.position, true AS "hasMembership"
     FROM ${memberTable} membership
     WHERE membership."workspaceMemberId" = ${workspaceMemberIdParameter}
       AND membership."deletedAt" IS NULL
     UNION ALL
     SELECT DISTINCT role_grant."recordId", NULL::float8, false
     FROM ${recordShareTable} role_grant
     WHERE role_grant."principalType" = 'ROLE' AND role_grant."rowCause" = 'RULE'
       AND role_grant."sourceId" = role_grant."recordId"
       AND role_grant."principalId" = ${roleIdParameter}
       AND role_grant."deletedAt" IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM ${memberTable} own_membership
         WHERE own_membership."channelId" = role_grant."recordId"
           AND own_membership."workspaceMemberId" = ${workspaceMemberIdParameter}
           AND own_membership."deletedAt" IS NULL
       )`;
};
