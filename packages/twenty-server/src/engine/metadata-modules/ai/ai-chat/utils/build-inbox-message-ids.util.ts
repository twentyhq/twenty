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
  senderKey,
  workspaceMemberId,
  threadKey,
  idempotencyKey,
}: {
  senderKey: string;
  workspaceMemberId: string;
  threadKey: string;
  idempotencyKey: string;
}): InboxMessageIds => {
  const threadId = buildInboxThreadId({
    senderKey,
    workspaceMemberId,
    threadKey,
  });
  const messageId = v5(
    `${threadId}:message:${idempotencyKey}`,
    INBOX_MESSAGE_ID_NAMESPACE,
  );

  // A thread holds a single hidden message, so every message the
  // application sends shares the turn that opener starts.
  return {
    threadId,
    messageId,
    toolCallId: `call_${messageId.replace(/-/g, '')}`,
    turnId: v5(`${threadId}:turn`, INBOX_MESSAGE_ID_NAMESPACE),
    openingMessageId: v5(`${threadId}:opening`, INBOX_MESSAGE_ID_NAMESPACE),
  };
};
