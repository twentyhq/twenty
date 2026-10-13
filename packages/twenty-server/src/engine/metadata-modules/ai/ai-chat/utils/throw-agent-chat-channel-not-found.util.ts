import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const throwAgentChatChannelNotFound = (): never => {
  throw new AiException(
    'Chat channel not found',
    AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
  );
};
