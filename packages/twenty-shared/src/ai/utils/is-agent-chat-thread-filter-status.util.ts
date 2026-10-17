import {
  AGENT_CHAT_THREAD_FILTER_STATUS,
  type AgentChatThreadFilterStatus,
} from '@/ai/constants/agent-chat-thread-filter-status.const';

export const isAgentChatThreadFilterStatus = (
  value: unknown,
): value is AgentChatThreadFilterStatus =>
  (Object.values(AGENT_CHAT_THREAD_FILTER_STATUS) as unknown[]).includes(value);
