import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const buildToolCallNotPendingException = (): AiException =>
  new AiException(
    'This tool call is no longer waiting for an answer',
    AiExceptionCode.TOOL_CALL_NOT_PENDING,
  );
