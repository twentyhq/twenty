import { isDefined } from 'twenty-shared/utils';

import { type AgentChatChannelThreadCursor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-thread-cursor.type';

// Activity-less chats sort last, so their cursor only pages through other activity-less chats
export const buildAgentChatChannelThreadCursorFilter = (
  cursor: AgentChatChannelThreadCursor | null,
): string => {
  if (!isDefined(cursor)) {
    return '';
  }

  if (!isDefined(cursor.lastActivityAt)) {
    return `AND thread."lastActivityAt" IS NULL AND thread.id < :channelThreadsCursorId::uuid`;
  }

  return `AND (thread."lastActivityAt" < :channelThreadsCursorLastActivityAt::timestamptz
    OR (thread."lastActivityAt" = :channelThreadsCursorLastActivityAt::timestamptz AND thread.id < :channelThreadsCursorId::uuid)
    OR thread."lastActivityAt" IS NULL)`;
};
