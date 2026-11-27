import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';

// position 0 keeps the single-call id, so retries of older messages still match
export const buildInboxMessageToolCallId = ({
  messageId,
  position,
}: {
  messageId: string;
  position: number;
}): string => {
  const toolCallUuid =
    position === 0
      ? messageId
      : v5(`${messageId}:tool-call:${position}`, INBOX_MESSAGE_ID_NAMESPACE);

  return `call_${toolCallUuid.replace(/-/g, '')}`;
};
