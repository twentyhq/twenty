import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatThreadPresetFilter,
} from '@/ai/constants/agent-chat-thread-preset-filter.const';
import { computeAgentChatTabThreadFieldGqlFilter } from '@/ai/utils/compute-agent-chat-tab-thread-field-gql-filter.util';
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

export const computeAgentChatThreadPresetFilterGqlFilter = ({
  presetFilter,
  workspaceMemberId,
}: PresetFilterArgs): RecordGqlOperationFilter => ({
  ...computeAgentChatTabThreadFieldGqlFilter({
    presetFilter,
    workspaceMemberId,
  }),
  ...computeViewPresetFilterGqlFilter({
    presetFilter: VIEW_PRESET_FILTER_BY_TAB[presetFilter],
    currentWorkspaceMemberId: workspaceMemberId,
  }),
});
