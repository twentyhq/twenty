import { assertAgentChatChannelExists } from 'src/engine/metadata-modules/ai/ai-chat/utils/assert-agent-chat-channel-exists.util';
import { buildAgentChatChannelDeletionLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-deletion-lock-key.util';
import { throwAgentChatChannelBusy } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-busy.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

export const lockAgentChatChannelForThreadWriteOrThrow = async ({
  transactionScope,
  workspaceId,
  channelId,
}: {
  transactionScope: Pick<WorkspaceTransactionScope, 'executeRawQuery'>;
  workspaceId: string;
  channelId: string;
}): Promise<void> => {
  const [{ isLocked }] = await transactionScope.executeRawQuery(
    'SELECT pg_try_advisory_xact_lock_shared(hashtextextended($1, 0)) AS "isLocked"',
    [buildAgentChatChannelDeletionLockKey({ workspaceId, channelId })],
  );

  if (isLocked !== true) {
    throwAgentChatChannelBusy();
  }

  await assertAgentChatChannelExists({
    transactionScope,
    workspaceId,
    channelId,
  });
};
