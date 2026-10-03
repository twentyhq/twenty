import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const throwAgentChatThreadNotFound = (): never => {
  throw new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND);
};
