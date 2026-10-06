import { isNull, isString } from '@sniptt/guards';
import { isValidUuid } from 'twenty-shared/utils';

import { type AgentChatInboxViewCursor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-inbox-view-cursor.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const LAST_ACTIVITY_AT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;

const throwInvalidCursor = (): never => {
  throw new AiException(
    'Invalid inbox view cursor',
    AiExceptionCode.INVALID_CHAT_INBOX_VIEW,
  );
};

export const decodeAgentChatInboxViewCursor = (
  cursor: string,
): AgentChatInboxViewCursor => {
  let decoded: unknown;

  try {
    decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    return throwInvalidCursor();
  }

  if (!Array.isArray(decoded) || decoded.length !== 2) {
    return throwInvalidCursor();
  }

  const [lastActivityAt, id] = decoded as unknown[];

  if (
    !(
      isNull(lastActivityAt) ||
      (isString(lastActivityAt) &&
        LAST_ACTIVITY_AT_PATTERN.test(lastActivityAt))
    ) ||
    !isString(id) ||
    !isValidUuid(id)
  ) {
    return throwInvalidCursor();
  }

  return { lastActivityAt, id };
};
