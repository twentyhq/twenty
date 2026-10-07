import { type EntityManager } from 'typeorm';

import { AGENT_CHAT_CHANNEL_MEMBER_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-channel-member-columns.constant';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';
import { type AgentChatChannelMemberWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel-member.workspace-entity';

// Each membership carries the READ_WRITE grant its member reads and replies
// in a private channel through, written in the same statement. A member
// lands at the end of their sidebar. Removed workspace members and existing
// memberships are skipped, so only new rows come back
export const insertAgentChatChannelMembers = async ({
  manager,
  workspaceId,
  channelId,
  memberIds,
  channelObjectMetadataId,
}: {
  manager: EntityManager;
  workspaceId: string;
  channelId: string;
  memberIds: string[];
  channelObjectMetadataId: string;
}): Promise<AgentChatChannelMemberWorkspaceEntity[]> => {
  const uniqueMemberIds = [...new Set(memberIds)];

  if (uniqueMemberIds.length === 0) {
    return [];
  }

  const { memberTable, recordShareTable, workspaceMemberTable } =
    getAgentChatChannelTables(workspaceId);

  return manager.query<AgentChatChannelMemberWorkspaceEntity[]>(
    `WITH inserted_member AS (
       INSERT INTO ${memberTable} ("channelId", "workspaceMemberId", position)
       SELECT $1, member.id, (
         SELECT COALESCE(MAX(existing.position), 0) + 1
         FROM ${memberTable} existing
         WHERE existing."workspaceMemberId" = member.id
       )
       FROM ${workspaceMemberTable} member
       WHERE member.id = ANY($2::uuid[]) AND member."deletedAt" IS NULL
       ON CONFLICT ("channelId", "workspaceMemberId") DO NOTHING
       RETURNING ${AGENT_CHAT_CHANNEL_MEMBER_COLUMNS}
     ), channel_grant AS (
       INSERT INTO ${recordShareTable}
         ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       SELECT $3::uuid, inserted_member."channelId", inserted_member."workspaceMemberId", 'WORKSPACE_MEMBER', 'READ_WRITE', 'RULE', inserted_member.id
       FROM inserted_member
       ON CONFLICT DO NOTHING
     )
     SELECT * FROM inserted_member`,
    [channelId, uniqueMemberIds, channelObjectMetadataId],
  );
};
