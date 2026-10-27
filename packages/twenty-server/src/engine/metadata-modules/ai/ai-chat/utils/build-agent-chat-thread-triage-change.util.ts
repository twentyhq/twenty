import { isDefined } from 'twenty-shared/utils';

import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { type AgentChatThreadTriageChange } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-triage-change.type';

export const buildAgentChatThreadTriageChange = ({
  action,
  snoozedUntil,
}: {
  action: AgentChatInboxAction;
  snoozedUntil: Date | null;
}): AgentChatThreadTriageChange | null => {
  switch (action) {
    case AgentChatInboxAction.ARCHIVE:
    case AgentChatInboxAction.MOVE_TO_INBOX:
      return { action };
    case AgentChatInboxAction.SNOOZE:
      return isDefined(snoozedUntil) ? { action, snoozedUntil } : null;
    default:
      return null;
  }
};
