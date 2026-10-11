import { type EntityManager } from 'typeorm';

import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';

// Everyone holding one of the roles reads and replies in the channel, so a
// role change takes effect the next time access is checked
export const writeAgentChatChannelRoleAccess = async ({
  manager,
  workspaceId,
  channelId,
  roleIds,
  channelObjectMetadataId,
  accessLevel = 'READ_WRITE',
}: {
  manager: EntityManager;
  workspaceId: string;
  channelId: string;
  roleIds: string[];
  channelObjectMetadataId: string;
  accessLevel?: 'READ_WRITE' | 'FULL';
}): Promise<void> => {
  const { recordShareTable } = getAgentChatChannelTables(workspaceId);

  await manager.query(
    `DELETE FROM ${recordShareTable}
     WHERE "recordId" = $1 AND "principalType" = 'ROLE' AND "rowCause" = 'RULE'
       AND "sourceId" = $1 AND NOT ("principalId" = ANY($2::uuid[]))`,
    [channelId, roleIds],
  );

  if (roleIds.length === 0) {
    return;
  }

  await manager.query(
    `INSERT INTO ${recordShareTable}
       ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
     SELECT $1, $2, role_id, 'ROLE', $4, 'RULE', $2
     FROM unnest($3::uuid[]) AS role_id
     ON CONFLICT DO NOTHING`,
    [channelObjectMetadataId, channelId, roleIds, accessLevel],
  );
};
