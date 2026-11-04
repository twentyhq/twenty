import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { buildAgentChatChannelGrantLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-grant-lock-key.util';

export const acquireAgentChatChannelGrantLocks = async ({
  manager,
  workspaceId,
  channelIds,
  mode,
}: {
  manager: Pick<EntityManager, 'query'>;
  workspaceId: string;
  channelIds: (string | null | undefined)[];
  mode: 'shared' | 'exclusive';
}): Promise<void> => {
  const sortedChannelIds = [...new Set(channelIds.filter(isDefined))].sort();

  for (const channelId of sortedChannelIds) {
    await manager.query(
      mode === 'shared'
        ? 'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))'
        : 'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      [buildAgentChatChannelGrantLockKey({ workspaceId, channelId })],
    );
  }
};
