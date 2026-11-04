import { type AgentChatChannelGrantScope } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-grant-scope.type';

export const buildAgentChatChannelGrantScopeConditions = (
  scope: AgentChatChannelGrantScope,
) =>
  'threadIds' in scope
    ? {
        thread: 'thread.id = ANY(:threadIds::uuid[])',
        recordShare: 'record_share."recordId" = ANY(:threadIds::uuid[])',
        parameters: { threadIds: scope.threadIds },
      }
    : {
        thread: 'thread."channelId" = :channelId',
        recordShare: 'record_share."sourceId" = :channelId',
        parameters: { channelId: scope.channelId },
      };
