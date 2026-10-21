import { type AgentChatInboxAction } from '@/ai/types/AgentChatInboxAction';

// Unsubscribing is left out: it fails on a chat assigned to the member, who cannot see that among unloaded chats
export const AGENT_CHAT_INBOX_TAB_ACTIONS: ReadonlySet<AgentChatInboxAction> =
  new Set<AgentChatInboxAction>([
    'READ',
    'UNREAD',
    'ARCHIVE',
    'SNOOZE',
    'MOVE_TO_INBOX',
  ]);
