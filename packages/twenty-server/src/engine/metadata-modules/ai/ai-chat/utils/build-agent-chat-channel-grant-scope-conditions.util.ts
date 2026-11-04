import { type AgentChatChannelGrantScope } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-grant-scope.type';

export const buildAgentChatChannelGrantScopeConditions = (
  scope: AgentChatChannelGrantScope,
) => {
  if ('threadIds' in scope) {
    return {
      thread: 'thread.id = ANY(:threadIds::uuid[])',
      recordShare: 'record_share."recordId" = ANY(:threadIds::uuid[])',
      parameters: { threadIds: scope.threadIds },
    };
  }

  return {
    thread: 'thread."channelId" = :channelId',
    recordShare: 'record_share."sourceId" = :channelId',
    parameters: { channelId: scope.channelId },
  };
};
