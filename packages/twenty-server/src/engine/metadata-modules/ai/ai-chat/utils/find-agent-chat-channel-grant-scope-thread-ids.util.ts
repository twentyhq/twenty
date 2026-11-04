import { type EntityManager } from 'typeorm';

import { type AgentChatChannelGrantScope } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-grant-scope.type';

export const findAgentChatChannelGrantScopeThreadIds = async ({
  manager,
  threadTable,
  scope,
}: {
  manager: Pick<EntityManager, 'createQueryBuilder'>;
  threadTable: string;
  scope: AgentChatChannelGrantScope;
}): Promise<string[]> => {
  if ('threadIds' in scope) {
    return scope.threadIds;
  }

  const channelThreads = await manager
    .createQueryBuilder()
    .select('thread.id', 'id')
    .from(threadTable, 'thread')
    .where('thread."channelId" = :channelId', { channelId: scope.channelId })
    .getRawMany<{ id: string }>();

  return channelThreads.map(({ id }) => id);
};
