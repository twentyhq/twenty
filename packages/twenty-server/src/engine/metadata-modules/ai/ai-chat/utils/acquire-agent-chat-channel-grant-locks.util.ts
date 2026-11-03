import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { AGENT_CHAT_ADVISORY_LOCK_QUERY_BY_MODE } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-advisory-lock-query-by-mode.constant';
import { acquireAgentChatThreadIdentityLock } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-thread-identity-lock.util';
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

  if (!isNonEmptyArray(sortedChannelIds)) {
    return;
  }

  if (mode === 'exclusive') {
    await acquireAgentChatThreadIdentityLock({
      manager,
      workspaceId,
      mode: 'shared',
    });
  }

  for (const channelId of sortedChannelIds) {
    await manager.query(AGENT_CHAT_ADVISORY_LOCK_QUERY_BY_MODE[mode], [
      buildAgentChatChannelGrantLockKey({ workspaceId, channelId }),
    ]);
  }
};
