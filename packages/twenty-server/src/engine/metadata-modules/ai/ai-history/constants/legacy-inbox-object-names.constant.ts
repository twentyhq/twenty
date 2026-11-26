import { type InboxObjectNames } from 'src/engine/metadata-modules/ai/ai-history/types/inbox-object-names.type';

export const LEGACY_INBOX_OBJECT_NAMES = {
  agentChatThread: 'agentChatThread',
  agentChatThreadParticipant: 'agentChatThreadParticipant',
  agentChatThreadTarget: 'agentChatThreadTarget',
  agentMessage: 'agentMessage',
  agentMessagePart: 'agentMessagePart',
  agentMessageReaction: 'agentMessageReaction',
  agentTurn: 'agentTurn',
} as const satisfies InboxObjectNames;
