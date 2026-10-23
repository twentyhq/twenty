import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { AGENT_CHAT_CHANNEL_GRANT_LOCK_TIMEOUT_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-channel-grant-lock-timeout-ms.constant';
import { acquireAgentChatChannelGrantLocks } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks.util';
import { isLockNotAvailableError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-lock-not-available-error.util';
import { throwAgentChatChannelBusy } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-busy.util';

export const acquireAgentChatChannelGrantLocksForThreadWriteOrThrow = async ({
  manager,
  workspaceId,
  channelIds,
}: {
  manager: Pick<EntityManager, 'query'>;
  workspaceId: string;
  channelIds: (string | null | undefined)[];
}): Promise<void> => {
  if (!channelIds.some(isDefined)) {
    return;
  }

  await manager.query(`SELECT set_config('lock_timeout', $1, true)`, [
    `${AGENT_CHAT_CHANNEL_GRANT_LOCK_TIMEOUT_MS}ms`,
  ]);

  await acquireAgentChatChannelGrantLocks({
    manager,
    workspaceId,
    channelIds,
    mode: 'shared',
  }).catch((error: unknown) => {
    if (isLockNotAvailableError(error)) {
      throwAgentChatChannelBusy();
    }

    throw error;
  });
};
