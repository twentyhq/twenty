import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_CHANNEL_GRANT_LOCK_TIMEOUT_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-channel-grant-lock-timeout-ms.constant';
import { acquireAgentChatChannelGrantLocks } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks.util';
import { isLockNotAvailableError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-lock-not-available-error.util';
import { throwAgentChatChannelBusy } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-busy.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

export const acquireAgentChatChannelGrantLocksForThreadWriteOrThrow = async ({
  transactionScope,
  workspaceId,
  channelIds,
}: {
  transactionScope: Pick<WorkspaceTransactionScope, 'executeRawQuery'>;
  workspaceId: string;
  channelIds: (string | null | undefined)[];
}): Promise<void> => {
  if (!channelIds.some(isDefined)) {
    return;
  }

  await transactionScope.executeRawQuery(
    `SELECT set_config('lock_timeout', $1, true)`,
    [`${AGENT_CHAT_CHANNEL_GRANT_LOCK_TIMEOUT_MS}ms`],
  );

  await acquireAgentChatChannelGrantLocks({
    transactionScope,
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
