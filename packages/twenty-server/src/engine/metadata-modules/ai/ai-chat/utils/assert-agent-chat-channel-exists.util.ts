import { isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { throwAgentChatChannelNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-not-found.util';

export const assertAgentChatChannelExists = async ({
  manager,
  workspaceId,
  channelId,
}: {
  manager: Pick<EntityManager, 'query'>;
  workspaceId: string;
  channelId: string;
}): Promise<void> => {
  const channels = await manager.query<{ id: string }[]>(
    'SELECT id FROM core."agentChatChannel" WHERE id = $1 AND "workspaceId" = $2',
    [channelId, workspaceId],
  );

  if (!isNonEmptyArray(channels)) {
    throwAgentChatChannelNotFound();
  }
};
