import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { type AgentChatChannelGrantScope } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-grant-scope.type';
import { buildAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-rule-grants.util';
import { deleteObsoleteAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/delete-obsolete-agent-chat-channel-rule-grants.util';
import { diffAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/diff-agent-chat-channel-rule-grants.util';
import { findAgentChatChannelGrantScopeThreads } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-channel-grant-scope-threads.util';
import { findAgentChatChannelRuleRoleIdsByChannelId } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-channel-rule-role-ids-by-channel-id.util';
import { findAgentChatThreadObjectMetadataId } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-thread-object-metadata-id.util';
import { findExistingAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-existing-agent-chat-channel-rule-grants.util';
import { insertMissingAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/insert-missing-agent-chat-channel-rule-grants.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

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
  const recordShareTable = `${schema}.recordShare`;
  const scopeThreads = await findAgentChatChannelGrantScopeThreads({
    manager,
    threadTable: `${schema}.agentChatThread`,
    scope,
  });
  const ruleRoleIdsByChannelId =
    await findAgentChatChannelRuleRoleIdsByChannelId({
      manager,
      workspaceId,
      channelIds: scopeThreads
        .map(({ channelId }) => channelId)
        .filter(isDefined),
    });
  const channelRuleGrants = buildAgentChatChannelRuleGrants({
    threads: scopeThreads,
    ruleRoleIdsByChannelId,
  });
  const existingChannelRuleGrants =
    await findExistingAgentChatChannelRuleGrants({
      manager,
      recordShareTable,
      threadObjectMetadataId,
      scope,
    });
  const { obsoleteGrantIds, missingGrants } = diffAgentChatChannelRuleGrants({
    channelRuleGrants,
    existingChannelRuleGrants,
  });

  await deleteObsoleteAgentChatChannelRuleGrants({
    manager,
    recordShareTable,
    obsoleteGrantIds,
  });

  await insertMissingAgentChatChannelRuleGrants({
    manager,
    recordShareTable,
    threadObjectMetadataId,
    missingGrants,
  });
};
