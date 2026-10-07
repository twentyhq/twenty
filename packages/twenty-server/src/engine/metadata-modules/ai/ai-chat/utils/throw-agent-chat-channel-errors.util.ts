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

export const throwAgentChatChannelManagementForbidden = (): never => {
  throw new AiException(
    'Only who manages the channel can do this',
    AiExceptionCode.CHAT_CHANNEL_MANAGEMENT_FORBIDDEN,
  );
};
