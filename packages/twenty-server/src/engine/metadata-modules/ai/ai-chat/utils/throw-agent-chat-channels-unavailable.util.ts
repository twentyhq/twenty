import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const throwAgentChatChannelsUnavailable = (): never => {
  throw new AiException(
    'Chat channels are not available until this workspace finishes upgrading',
    AiExceptionCode.CHAT_CHANNELS_UNAVAILABLE,
  );
};
