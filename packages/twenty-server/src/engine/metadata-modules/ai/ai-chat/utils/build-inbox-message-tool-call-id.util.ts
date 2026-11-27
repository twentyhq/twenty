import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';

// The first call keeps the id of a message that could hold only one, so a
// retry of a message sent before still finds its call.
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
