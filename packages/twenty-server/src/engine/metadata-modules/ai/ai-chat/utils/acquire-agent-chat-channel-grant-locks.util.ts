import { isDefined } from 'twenty-shared/utils';

import { buildAgentChatChannelGrantLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-grant-lock-key.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

export const acquireAgentChatChannelGrantLocks = async ({
  transactionScope,
  workspaceId,
  channelIds,
  mode,
}: {
  transactionScope: Pick<WorkspaceTransactionScope, 'executeRawQuery'>;
  workspaceId: string;
  channelIds: (string | null | undefined)[];
  mode: 'shared' | 'exclusive';
}): Promise<void> => {
  const sortedChannelIds = [...new Set(channelIds.filter(isDefined))].sort();

  for (const channelId of sortedChannelIds) {
    await transactionScope.executeRawQuery(
      mode === 'shared'
        ? 'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))'
        : 'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      [buildAgentChatChannelGrantLockKey({ workspaceId, channelId })],
    );
  }
};
