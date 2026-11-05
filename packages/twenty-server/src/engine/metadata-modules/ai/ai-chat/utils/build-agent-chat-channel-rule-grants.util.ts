import { isDefined } from 'twenty-shared/utils';

import { type AgentChatChannelRuleGrant } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-rule-grant.type';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export const buildAgentChatChannelRuleGrants = ({
  threads,
  ruleRoleIdsByChannelId,
}: {
  threads: Pick<AgentChatThreadWorkspaceEntity, 'id' | 'channelId'>[];
  ruleRoleIdsByChannelId: Map<string, Set<string>>;
}): AgentChatChannelRuleGrant[] =>
  threads.flatMap(({ id: recordId, channelId }) => {
    if (!isDefined(channelId)) {
      return [];
    }

    const ruleRoleIds = ruleRoleIdsByChannelId.get(channelId) ?? [];

    return [...ruleRoleIds].map((principalId) => ({
      recordId,
      principalId,
      sourceId: channelId,
    }));
  });
