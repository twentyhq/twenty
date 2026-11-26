import { type InboxObjectNamesByLegacyName } from '@/ai/types/InboxObjectNamesByLegacyName';

export const LEGACY_INBOX_OBJECT_NAMES_BY_LEGACY_NAME = {
  agentChatThread: 'agentChatThread',
  agentChatThreadParticipant: 'agentChatThreadParticipant',
  agentChatThreadTarget: 'agentChatThreadTarget',
  agentMessage: 'agentMessage',
  agentMessagePart: 'agentMessagePart',
  agentMessageReaction: 'agentMessageReaction',
  agentTurn: 'agentTurn',
} as const satisfies InboxObjectNamesByLegacyName;
