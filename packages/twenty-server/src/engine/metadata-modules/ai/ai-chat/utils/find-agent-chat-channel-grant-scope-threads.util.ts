import { type EntityManager } from 'typeorm';

import { type AgentChatChannelGrantScope } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-grant-scope.type';
import { buildAgentChatChannelGrantScopeConditions } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-grant-scope-conditions.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export const findAgentChatChannelGrantScopeThreads = ({
  manager,
  threadTable,
  scope,
}: {
  manager: Pick<EntityManager, 'createQueryBuilder'>;
  threadTable: string;
  scope: AgentChatChannelGrantScope;
}): Promise<Pick<AgentChatThreadWorkspaceEntity, 'id' | 'channelId'>[]> => {
  const scopeConditions = buildAgentChatChannelGrantScopeConditions(scope);

  return manager
    .createQueryBuilder()
    .select('thread.id', 'id')
    .addSelect('thread."channelId"', 'channelId')
    .from(threadTable, 'thread')
    .where(scopeConditions.thread, scopeConditions.parameters)
    .getRawMany<Pick<AgentChatThreadWorkspaceEntity, 'id' | 'channelId'>>();
};
