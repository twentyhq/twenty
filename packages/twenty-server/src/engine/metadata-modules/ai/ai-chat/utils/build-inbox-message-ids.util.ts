import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';
import { buildInboxThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-thread-id.util';

type InboxMessageIds = {
  threadId: string;
  turnId: string;
  openingMessageId: string;
  messageId: string;
  toolCallId: string;
};

export const buildInboxMessageIds = ({
  conversationKey,
  idempotencyKey,
}: {
  conversationKey: string;
  idempotencyKey: string;
}): InboxMessageIds => {
  const messageId = v5(
    `${conversationKey}:message:${idempotencyKey}`,
    INBOX_MESSAGE_ID_NAMESPACE,
  );

  // A thread opens with a single context message, so every message the
  // application sends shares the turn that opener starts.
  return {
    threadId: buildInboxThreadId({ conversationKey }),
    messageId,
    toolCallId: `call_${messageId.replace(/-/g, '')}`,
    turnId: v5(`${conversationKey}:turn`, INBOX_MESSAGE_ID_NAMESPACE),
    openingMessageId: v5(
      `${conversationKey}:opening`,
      INBOX_MESSAGE_ID_NAMESPACE,
    ),
  };
};
