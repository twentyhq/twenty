import { type EntityManager } from 'typeorm';

import { assertAgentChatChannelExists } from 'src/engine/metadata-modules/ai/ai-chat/utils/assert-agent-chat-channel-exists.util';
import { buildAgentChatChannelDeletionLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-deletion-lock-key.util';
import { throwAgentChatChannelBusy } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-busy.util';

export const lockAgentChatChannelForThreadWriteOrThrow = async ({
  manager,
  workspaceId,
  channelId,
}: {
  manager: Pick<EntityManager, 'query'>;
  workspaceId: string;
  channelId: string;
}): Promise<void> => {
  const [{ isLocked }] = await manager.query<{ isLocked: boolean }[]>(
    'SELECT pg_try_advisory_xact_lock_shared(hashtextextended($1, 0)) AS "isLocked"',
    [buildAgentChatChannelDeletionLockKey({ workspaceId, channelId })],
  );

  if (!isLocked) {
    throwAgentChatChannelBusy();
  }

  await assertAgentChatChannelExists({ manager, workspaceId, channelId });
};
