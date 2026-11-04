import { isNonEmptyArray } from 'twenty-shared/utils';

import { throwAgentChatChannelNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-not-found.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

export const assertAgentChatChannelExists = async ({
  transactionScope,
  workspaceId,
  channelId,
}: {
  transactionScope: Pick<WorkspaceTransactionScope, 'executeRawQuery'>;
  workspaceId: string;
  channelId: string;
}): Promise<void> => {
  const channels = await transactionScope.executeRawQuery(
    'SELECT id FROM core."agentChatChannel" WHERE id = $1 AND "workspaceId" = $2',
    [channelId, workspaceId],
  );

  if (!isNonEmptyArray(channels)) {
    throwAgentChatChannelNotFound();
  }
};
