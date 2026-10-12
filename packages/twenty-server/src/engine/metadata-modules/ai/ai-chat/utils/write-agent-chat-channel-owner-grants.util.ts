import { type EntityManager } from 'typeorm';

import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';

// Owners manage the channel through a FULL grant, as a creator does a record
export const writeAgentChatChannelOwnerGrants = async ({
  manager,
  workspaceId,
  channelId,
  ownerIds,
  channelObjectMetadataId,
}: {
  manager: EntityManager;
  workspaceId: string;
  channelId: string;
  ownerIds: string[];
  channelObjectMetadataId: string;
}): Promise<void> => {
  if (ownerIds.length === 0) {
    return;
  }

  const { recordShareTable } = getAgentChatChannelTables(workspaceId);

  await manager.query(
    `INSERT INTO ${recordShareTable}
       ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
     SELECT $1::uuid, $2::uuid, owner_id, 'WORKSPACE_MEMBER', 'FULL', 'OWNER', $2::uuid
     FROM unnest($3::uuid[]) AS owner_id
     ON CONFLICT DO NOTHING`,
    [channelObjectMetadataId, channelId, ownerIds],
  );
};
