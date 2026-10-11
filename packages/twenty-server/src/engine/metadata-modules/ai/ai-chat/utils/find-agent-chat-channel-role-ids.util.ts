import { type EntityManager } from 'typeorm';

import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';

export const findAgentChatChannelRoleIds = async ({
  manager,
  workspaceId,
  channelId,
}: {
  manager: EntityManager;
  workspaceId: string;
  channelId: string;
}): Promise<string[]> => {
  const { recordShareTable } = getAgentChatChannelTables(workspaceId);

  const rows = await manager.query<{ roleId: string }[]>(
    `SELECT DISTINCT "principalId" AS "roleId" FROM ${recordShareTable}
     WHERE "recordId" = $1 AND "principalType" = 'ROLE' AND "rowCause" = 'RULE'
       AND "sourceId" = $1 AND "deletedAt" IS NULL
     ORDER BY "principalId"`,
    [channelId],
  );

  return rows.map(({ roleId }) => roleId);
};
