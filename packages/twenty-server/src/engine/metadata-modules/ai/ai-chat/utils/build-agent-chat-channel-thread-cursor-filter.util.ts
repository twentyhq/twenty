import { isDefined } from 'twenty-shared/utils';

import { type AgentChatChannelThreadCursor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-thread-cursor.type';

export const buildAgentChatChannelThreadCursorFilter = ({
  cursor,
  isSnoozed,
}: {
  cursor: AgentChatChannelThreadCursor | null;
  isSnoozed: boolean;
}): string => {
  if (!isDefined(cursor)) {
    return '';
  }

  const sortColumn = isSnoozed
    ? 'thread."channelSnoozedUntil"'
    : 'thread."lastActivityAt"';

  if (!isDefined(cursor.sortAt)) {
    return `AND ${sortColumn} IS NULL AND thread.id < :channelThreadsCursorId::uuid`;
  }

  const comparison = isSnoozed ? '>' : '<';

  return `AND (${sortColumn} ${comparison} :channelThreadsCursorSortAt::timestamptz
    OR (${sortColumn} = :channelThreadsCursorSortAt::timestamptz AND thread.id < :channelThreadsCursorId::uuid)
    OR ${sortColumn} IS NULL)`;
};
