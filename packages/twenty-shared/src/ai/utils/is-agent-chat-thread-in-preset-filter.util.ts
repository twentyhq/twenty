import { type AgentChatThreadPresetFilter } from '@/ai/constants/agent-chat-thread-preset-filter.const';
import { AgentChatThreadConversationType } from '@/ai/types/AgentChatThreadConversationType';
import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { isDefined } from '@/utils/validation/isDefined';

// TODO(@bosiraphael): remove once the inbox list reads saved views; only the old inbox tabs use it (twentyhq/core-team-issues#3209)
export const isAgentChatThreadInPresetFilter = ({
  thread,
  inboxStatus,
  presetFilter,
}: {
  thread: {
    conversationType?: AgentChatThreadConversationType | null;
    pendingQuestionMessageId?: string | null;
    assigneeId?: string | null;
  };
  inboxStatus: Pick<
    AgentChatThreadInboxStatus,
    'scope' | 'isMentioned' | 'isAssignedToMe'
  >;
  presetFilter: AgentChatThreadPresetFilter;
}): boolean => {
  if (
    thread.conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
  ) {
    return false;
  }

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
