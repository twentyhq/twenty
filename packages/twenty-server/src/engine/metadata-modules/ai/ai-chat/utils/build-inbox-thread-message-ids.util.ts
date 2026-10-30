import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';

type InboxThreadMessageIds = {
  threadId: string;
  turnId: string;
  messageId: string;
  toolCallId: string;
  openingMessageId: null;
};

// Scoped to the sender, so two senders using the same idempotency key in a
// conversation neither opened write two messages instead of one. Neither
// opened it, so no opener is written
export const buildInboxThreadMessageIds = ({
  threadId,
  senderScope,
  idempotencyKey,
}: {
  threadId: string;
  senderScope: string;
  idempotencyKey: string;
}): InboxThreadMessageIds => {
  const scope = `${threadId}:${senderScope}`;
  const messageId = v5(
    `${scope}:message:${idempotencyKey}`,
    INBOX_MESSAGE_ID_NAMESPACE,
  );

  return {
    threadId,
    messageId,
    toolCallId: `call_${messageId.replace(/-/g, '')}`,
    turnId: v5(`${scope}:turn`, INBOX_MESSAGE_ID_NAMESPACE),
    openingMessageId: null,
  };
};
