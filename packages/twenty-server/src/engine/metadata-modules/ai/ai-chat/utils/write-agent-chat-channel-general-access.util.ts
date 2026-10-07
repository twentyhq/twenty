import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { type EntityManager } from 'typeorm';

import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';

// Everyone reads and replies in a public channel through its general access
export const writeAgentChatChannelGeneralAccess = async ({
  manager,
  workspaceId,
  channelId,
  visibility,
  channelObjectMetadataId,
}: {
  manager: EntityManager;
  workspaceId: string;
  channelId: string;
  visibility: AgentChatChannelVisibility;
  channelObjectMetadataId: string;
}): Promise<void> => {
  const { recordShareTable } = getAgentChatChannelTables(workspaceId);

  if (visibility === AgentChatChannelVisibility.PRIVATE) {
    await manager.query(
      `DELETE FROM ${recordShareTable}
       WHERE "recordId" = $1 AND "principalType" = 'EVERYONE' AND "rowCause" = 'RULE'`,
      [channelId],
    );

    return;
  }

  await manager.query(
    `INSERT INTO ${recordShareTable}
       ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
     VALUES ($1, $2, $3, 'EVERYONE', 'READ_WRITE', 'RULE', $2)
     ON CONFLICT DO NOTHING`,
    [channelObjectMetadataId, channelId, EVERYONE_PRINCIPAL_ID],
  );
};
