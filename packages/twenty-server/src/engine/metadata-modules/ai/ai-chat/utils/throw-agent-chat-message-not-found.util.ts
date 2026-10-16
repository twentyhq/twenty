import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const throwAgentChatMessageNotFound = (): never => {
  throw new AiException(
    'Chat message not found',
    AiExceptionCode.MESSAGE_NOT_FOUND,
  );
};
