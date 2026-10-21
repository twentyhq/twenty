import { type EntityManager } from 'typeorm';

import { AGENT_CHAT_CHANNEL_DELETION_LOCK_TIMEOUT_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-channel-deletion-lock-timeout-ms.constant';
import { buildAgentChatChannelDeletionLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-deletion-lock-key.util';
import { isLockNotAvailableError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-lock-not-available-error.util';
import { throwAgentChatChannelBusy } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-busy.util';

export const lockAgentChatChannelForDeletionOrThrow = async ({
  manager,
  workspaceId,
  channelId,
}: {
  manager: Pick<EntityManager, 'query'>;
  workspaceId: string;
  channelId: string;
}): Promise<void> => {
  await manager.query(`SELECT set_config('lock_timeout', $1, true)`, [
    `${AGENT_CHAT_CHANNEL_DELETION_LOCK_TIMEOUT_MS}ms`,
  ]);

  await manager
    .query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [
      buildAgentChatChannelDeletionLockKey({ workspaceId, channelId }),
    ])
    .catch((error: unknown) => {
      if (isLockNotAvailableError(error)) {
        throwAgentChatChannelBusy();
      }

      throw error;
    });
};
