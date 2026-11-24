import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatThreadPresetFilter,
} from '@/ai/constants/agent-chat-thread-preset-filter.const';
import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';

export const computeAgentChatThreadPresetFieldsGqlFilter = ({
  presetFilter,
  workspaceMemberId,
}: {
  presetFilter: AgentChatThreadPresetFilter;
  workspaceMemberId: string;
}): RecordGqlOperationFilter => {
  switch (presetFilter) {
    case AGENT_CHAT_THREAD_PRESET_FILTER.NEEDS_INPUT:
      return { pendingQuestionMessageId: { is: 'NOT_NULL' } };
    case AGENT_CHAT_THREAD_PRESET_FILTER.ASSIGNED_TO_ME:
      return { assigneeId: { eq: workspaceMemberId } };
    case AGENT_CHAT_THREAD_PRESET_FILTER.ASSIGNED_TO_ANYONE:
      return { assigneeId: { is: 'NOT_NULL' } };
    case AGENT_CHAT_THREAD_PRESET_FILTER.UNASSIGNED:
      return { assigneeId: { is: 'NULL' } };
    case AGENT_CHAT_THREAD_PRESET_FILTER.OPEN:
    case AGENT_CHAT_THREAD_PRESET_FILTER.MENTIONS:
    case AGENT_CHAT_THREAD_PRESET_FILTER.SNOOZED:
    case AGENT_CHAT_THREAD_PRESET_FILTER.DONE:
      return {};
  }
};
