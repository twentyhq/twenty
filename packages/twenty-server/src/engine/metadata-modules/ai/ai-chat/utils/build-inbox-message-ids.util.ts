import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';

export type InboxMessageIds = {
  threadId: string;
  turnId: string;
  openingMessageId: string;
  messageId: string;
};

export const buildInboxMessageIds = ({
  applicationId,
  workspaceMemberId,
  idempotencyKey,
}: {
  applicationId: string;
  workspaceMemberId: string;
  idempotencyKey: string;
}): InboxMessageIds => {
  const threadId = v5(
    `${applicationId}:${workspaceMemberId}:${idempotencyKey}`,
    INBOX_MESSAGE_ID_NAMESPACE,
  );

  return {
    threadId,
    turnId: v5(`${threadId}:turn`, INBOX_MESSAGE_ID_NAMESPACE),
    openingMessageId: v5(`${threadId}:opening`, INBOX_MESSAGE_ID_NAMESPACE),
    messageId: v5(`${threadId}:message`, INBOX_MESSAGE_ID_NAMESPACE),
  };
};
