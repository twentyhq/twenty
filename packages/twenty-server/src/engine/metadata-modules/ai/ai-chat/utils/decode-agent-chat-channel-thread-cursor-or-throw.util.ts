import { isValidUuid } from 'twenty-shared/utils';
import { z } from 'zod';

import { type AgentChatChannelThreadCursor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-thread-cursor.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { tryParseJsonArray } from 'src/utils/try-parse-json-array';

const LAST_ACTIVITY_AT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;

const AGENT_CHAT_CHANNEL_THREAD_CURSOR_SCHEMA = z.tuple([
  z.string().regex(LAST_ACTIVITY_AT_PATTERN).nullable(),
  z.string().refine(isValidUuid),
]);

export const decodeAgentChatChannelThreadCursorOrThrow = (
  cursor: string,
): AgentChatChannelThreadCursor => {
  const result = AGENT_CHAT_CHANNEL_THREAD_CURSOR_SCHEMA.safeParse(
    tryParseJsonArray(Buffer.from(cursor, 'base64url').toString('utf8')),
  );

  if (!result.success) {
    throw new AiException(
      'Invalid channel chats cursor',
      AiExceptionCode.INVALID_CHAT_CHANNEL_THREAD_CURSOR,
    );
  }

  const [lastActivityAt, id] = result.data;

  return { lastActivityAt, id };
};
