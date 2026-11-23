import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatThreadPresetFilter,
} from '@/ai/constants/agent-chat-thread-preset-filter.const';
import { computeViewPresetFilterGqlFilter } from '@/ai/utils/compute-view-preset-filter-gql-filter.util';
import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';
import { ViewPresetFilter } from '@/types/ViewPresetFilter';

type PresetFilterArgs = {
  presetFilter: AgentChatThreadPresetFilter;
  workspaceMemberId: string;
};

const VIEW_PRESET_FILTER_BY_TAB: Record<
  AgentChatThreadPresetFilter,
  ViewPresetFilter
> = {
  [AGENT_CHAT_THREAD_PRESET_FILTER.OPEN]: ViewPresetFilter.INBOX_OPEN,
  [AGENT_CHAT_THREAD_PRESET_FILTER.NEEDS_INPUT]: ViewPresetFilter.INBOX_OPEN,
  [AGENT_CHAT_THREAD_PRESET_FILTER.MENTIONS]: ViewPresetFilter.INBOX_MENTIONS,
  [AGENT_CHAT_THREAD_PRESET_FILTER.ASSIGNED_TO_ME]: ViewPresetFilter.INBOX_OPEN,
  [AGENT_CHAT_THREAD_PRESET_FILTER.ASSIGNED_TO_ANYONE]:
    ViewPresetFilter.INBOX_OPEN,
  [AGENT_CHAT_THREAD_PRESET_FILTER.UNASSIGNED]: ViewPresetFilter.INBOX_OPEN,
  [AGENT_CHAT_THREAD_PRESET_FILTER.SNOOZED]: ViewPresetFilter.INBOX_SNOOZED,
  [AGENT_CHAT_THREAD_PRESET_FILTER.DONE]: ViewPresetFilter.INBOX_DONE,
};

const computeTabThreadFieldFilter = ({
  presetFilter,
  workspaceMemberId,
}: PresetFilterArgs): RecordGqlOperationFilter => {
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

export const computeAgentChatThreadPresetFilterGqlFilter = ({
  presetFilter,
  workspaceMemberId,
}: PresetFilterArgs): RecordGqlOperationFilter => ({
  ...computeTabThreadFieldFilter({ presetFilter, workspaceMemberId }),
  ...computeViewPresetFilterGqlFilter({
    presetFilter: VIEW_PRESET_FILTER_BY_TAB[presetFilter],
    currentWorkspaceMemberId: workspaceMemberId,
  }),
});
