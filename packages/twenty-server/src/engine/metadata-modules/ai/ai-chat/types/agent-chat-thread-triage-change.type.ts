import { type AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';

export type AgentChatThreadTriageChange =
  | { action: AgentChatInboxAction.ARCHIVE }
  | { action: AgentChatInboxAction.SNOOZE; snoozedUntil: Date }
  | { action: AgentChatInboxAction.MOVE_TO_INBOX };
