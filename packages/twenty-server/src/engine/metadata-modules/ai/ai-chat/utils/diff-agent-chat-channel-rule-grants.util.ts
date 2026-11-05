import { type AgentChatChannelRuleGrant } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-rule-grant.type';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';

const buildChannelRuleGrantKey = ({
  recordId,
  principalId,
  sourceId,
}: AgentChatChannelRuleGrant): string =>
  `${recordId}:${principalId}:${sourceId}`;

export const diffAgentChatChannelRuleGrants = ({
  channelRuleGrants,
  existingChannelRuleGrants,
}: {
  channelRuleGrants: AgentChatChannelRuleGrant[];
  existingChannelRuleGrants: Pick<
    RecordShare,
    'id' | 'recordId' | 'principalId' | 'sourceId'
  >[];
}): {
  obsoleteGrantIds: string[];
  missingGrants: AgentChatChannelRuleGrant[];
} => {
  const channelRuleGrantKeys = new Set(
    channelRuleGrants.map(buildChannelRuleGrantKey),
  );
  const existingChannelRuleGrantKeys = new Set(
    existingChannelRuleGrants.map(buildChannelRuleGrantKey),
  );

  return {
    obsoleteGrantIds: existingChannelRuleGrants
      .filter(
        (grant) => !channelRuleGrantKeys.has(buildChannelRuleGrantKey(grant)),
      )
      .map(({ id }) => id),
    missingGrants: channelRuleGrants.filter(
      (grant) =>
        !existingChannelRuleGrantKeys.has(buildChannelRuleGrantKey(grant)),
    ),
  };
};
