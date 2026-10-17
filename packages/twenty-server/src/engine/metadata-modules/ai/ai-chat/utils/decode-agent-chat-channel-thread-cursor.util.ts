import { isValidUuid } from 'twenty-shared/utils';
import { z } from 'zod';

import { type AgentChatChannelThreadCursor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-thread-cursor.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const LAST_ACTIVITY_AT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;

const AGENT_CHAT_CHANNEL_THREAD_CURSOR_SCHEMA = z.tuple([
  z.string().regex(LAST_ACTIVITY_AT_PATTERN).nullable(),
  z.string().refine(isValidUuid),
]);

const throwInvalidCursor = (): never => {
  throw new AiException(
    'Invalid channel chats cursor',
    AiExceptionCode.INVALID_CHAT_CHANNEL_THREAD_CURSOR,
  );
};

export const decodeAgentChatChannelThreadCursor = (
  cursor: string,
): AgentChatChannelThreadCursor => {
  let decoded: unknown;

  try {
    decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    return throwInvalidCursor();
  }

  const result = AGENT_CHAT_CHANNEL_THREAD_CURSOR_SCHEMA.safeParse(decoded);

  if (!result.success) {
    return throwInvalidCursor();
  }

  const [lastActivityAt, id] = result.data;

  return { lastActivityAt, id };
};
