import { type EntityManager } from 'typeorm';

import { buildAgentChatChannelRoleGrantCondition } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-role-grant-condition.util';
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
    `SELECT DISTINCT role_grant."principalId" AS "roleId"
     FROM ${recordShareTable} role_grant
     WHERE role_grant."recordId" = $1
       AND ${buildAgentChatChannelRoleGrantCondition('role_grant')}
     ORDER BY role_grant."principalId"`,
    [channelId],
  );

  return rows.map(({ roleId }) => roleId);
};
