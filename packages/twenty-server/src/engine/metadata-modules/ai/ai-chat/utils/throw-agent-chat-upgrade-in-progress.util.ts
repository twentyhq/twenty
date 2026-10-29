import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const throwAgentChatUpgradeInProgress = (): never => {
  throw new AiException(
    'Chats are not available until this workspace finishes upgrading',
    AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS,
  );
};
