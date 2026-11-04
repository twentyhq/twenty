import chunk from 'lodash.chunk';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { type AgentChatChannelGrantScope } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-grant-scope.type';
import { buildAgentChatChannelGrantScopeConditions } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-grant-scope-conditions.util';
import { buildAgentChatChannelRuleGrantsQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-rule-grants-query.util';
import { deleteObsoleteAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/delete-obsolete-agent-chat-channel-rule-grants.util';
import { findAgentChatChannelGrantScopeThreadIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-channel-grant-scope-thread-ids.util';
import { findAgentChatThreadObjectMetadataId } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-thread-object-metadata-id.util';
import { insertMissingAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/insert-missing-agent-chat-channel-rule-grants.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const CHANNEL_RULE_GRANT_THREAD_BATCH_SIZE = 1000;

export const replaceAgentChatChannelRuleGrants = async ({
  manager,
  workspaceId,
  scope,
}: {
  manager: Pick<EntityManager, 'createQueryBuilder' | 'getRepository'>;
  workspaceId: string;
  scope: AgentChatChannelGrantScope;
}): Promise<void> => {
  if ('threadIds' in scope && !isNonEmptyArray(scope.threadIds)) {
    return;
  }

  const threadObjectMetadataId = await findAgentChatThreadObjectMetadataId({
    manager,
    workspaceId,
  });

  if (!isDefined(threadObjectMetadataId)) {
    return;
  }

  const schema = getWorkspaceSchemaName(workspaceId);
  const threadTable = `${schema}.agentChatThread`;
  const recordShareTable = `${schema}.recordShare`;
  const scopeConditions = buildAgentChatChannelGrantScopeConditions(scope);
  const channelRuleGrantsQuery = buildAgentChatChannelRuleGrantsQuery({
    manager,
    workspaceId,
    threadTable,
  });
  const scopedChannelRuleGrantsQuery = channelRuleGrantsQuery
    .clone()
    .andWhere(scopeConditions.thread, scopeConditions.parameters);

  await deleteObsoleteAgentChatChannelRuleGrants({
    manager,
    recordShareTable,
    threadObjectMetadataId,
    recordShareScopeCondition: scopeConditions.recordShare,
    channelRuleGrantsQuery: scopedChannelRuleGrantsQuery,
  });

  const scopeThreadIds = await findAgentChatChannelGrantScopeThreadIds({
    manager,
    threadTable,
    scope,
  });

  for (const threadIds of chunk(
    scopeThreadIds,
    CHANNEL_RULE_GRANT_THREAD_BATCH_SIZE,
  )) {
    await insertMissingAgentChatChannelRuleGrants({
      manager,
      recordShareTable,
      threadObjectMetadataId,
      channelRuleGrantsQuery,
      threadIds,
    });
  }
};
