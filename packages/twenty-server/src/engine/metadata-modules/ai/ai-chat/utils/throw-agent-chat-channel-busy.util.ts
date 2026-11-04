import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const throwAgentChatChannelBusy = (): never => {
  throw new AiException(
    'Chat channel is busy',
    AiExceptionCode.CHAT_CHANNEL_BUSY,
  );
};
