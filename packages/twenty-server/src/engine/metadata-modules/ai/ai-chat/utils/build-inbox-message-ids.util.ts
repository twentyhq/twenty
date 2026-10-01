import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';

type InboxMessageIds = {
  threadId: string;
  turnId: string;
  openingMessageId: string;
  messageId: string;
};

export const buildInboxMessageIds = ({
  applicationId,
  workspaceMemberId,
  threadKey,
  idempotencyKey,
}: {
  applicationId: string;
  workspaceMemberId: string;
  threadKey: string;
  idempotencyKey: string;
}): InboxMessageIds => {
  const threadId = v5(
    `${applicationId}:${workspaceMemberId}:${threadKey}`,
    INBOX_MESSAGE_ID_NAMESPACE,
  );
  const messageId = v5(
    `${threadId}:${idempotencyKey}`,
    INBOX_MESSAGE_ID_NAMESPACE,
  );

  // A thread holds a single hidden message, so every message the
  // application sends shares the turn that opener starts.
  return {
    threadId,
    messageId,
    turnId: v5(`${threadId}:turn`, INBOX_MESSAGE_ID_NAMESPACE),
    openingMessageId: v5(`${threadId}:opening`, INBOX_MESSAGE_ID_NAMESPACE),
  };
};
