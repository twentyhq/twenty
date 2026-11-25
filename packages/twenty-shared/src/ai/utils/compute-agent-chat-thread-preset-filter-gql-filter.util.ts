import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatThreadPresetFilter,
} from '@/ai/constants/agent-chat-thread-preset-filter.const';
import { turnAgentChatThreadPresetFilterIntoThreadFieldsRecordGqlOperationFilter } from '@/ai/utils/turn-agent-chat-thread-preset-filter-into-thread-fields-record-gql-operation-filter.util';
import { turnViewPresetFilterIntoRecordGqlOperationFilter } from '@/ai/utils/turn-view-preset-filter-into-record-gql-operation-filter.util';
import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';
import { ViewPresetFilter } from '@/types/ViewPresetFilter';

type PresetFilterArgs = {
  presetFilter: AgentChatThreadPresetFilter;
  workspaceMemberId: string;
};

// TODO(@bosiraphael): remove with the old inbox tabs; maps each tab to the view preset it reads (twentyhq/core-team-issues#3209)
const VIEW_PRESET_FILTER_BY_AGENT_CHAT_THREAD_PRESET_FILTER: Record<
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

// TODO(@bosiraphael): remove once the inbox list reads saved views; glue with the old inbox tabs (twentyhq/core-team-issues#3209)
export const computeAgentChatThreadPresetFilterGqlFilter = ({
  presetFilter,
  workspaceMemberId,
}: PresetFilterArgs): RecordGqlOperationFilter => ({
  ...turnAgentChatThreadPresetFilterIntoThreadFieldsRecordGqlOperationFilter({
    presetFilter,
    workspaceMemberId,
  }),
  ...turnViewPresetFilterIntoRecordGqlOperationFilter({
    presetFilter:
      VIEW_PRESET_FILTER_BY_AGENT_CHAT_THREAD_PRESET_FILTER[presetFilter],
    currentWorkspaceMemberId: workspaceMemberId,
  }),
});
