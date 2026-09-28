import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const DEFAULT_CHAT_THREADS_FOR_RECORD_LIMIT = 20;
export const MAX_CHAT_THREADS_FOR_RECORD_LIMIT = 100;

export const assertValidChatThreadsForRecordPagination = ({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}): void => {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_CHAT_THREADS_FOR_RECORD_LIMIT
  ) {
    throw new AiException(
      `limit must be an integer between 1 and ${MAX_CHAT_THREADS_FOR_RECORD_LIMIT}`,
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new AiException(
      'offset must be a non-negative integer',
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }
};
