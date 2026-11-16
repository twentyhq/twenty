import { type AgentChatThreadPresetFilter } from '@/ai/constants/agent-chat-thread-preset-filter.const';
import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { isDefined } from '@/utils/validation/isDefined';

export const isAgentChatThreadInPresetFilter = ({
  thread,
  inboxStatus,
  presetFilter,
}: {
  thread: {
    pendingQuestionMessageId?: string | null;
    assigneeId?: string | null;
  };
  inboxStatus: Pick<
    AgentChatThreadInboxStatus,
    'scope' | 'isMentioned' | 'isAssignedToMe'
  >;
  presetFilter: AgentChatThreadPresetFilter;
}): boolean => {
  switch (presetFilter) {
    case 'active':
      return inboxStatus.scope === 'INBOX';
    case 'needsInput':
      return (
        inboxStatus.scope === 'INBOX' &&
        isDefined(thread.pendingQuestionMessageId)
      );
    case 'mentions':
      return inboxStatus.scope === 'INBOX' && inboxStatus.isMentioned;
    case 'assigned':
      return inboxStatus.scope === 'INBOX' && inboxStatus.isAssignedToMe;
    case 'assignedToAnyone':
      return inboxStatus.scope === 'INBOX' && isDefined(thread.assigneeId);
    case 'unassigned':
      return inboxStatus.scope === 'INBOX' && !isDefined(thread.assigneeId);
    case 'snoozed':
      return inboxStatus.scope === 'SNOOZED';
    case 'done':
      return inboxStatus.scope === 'ARCHIVED';
  }
};
