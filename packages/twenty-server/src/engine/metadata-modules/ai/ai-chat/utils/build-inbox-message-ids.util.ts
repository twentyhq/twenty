import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';

type InboxMessageIds = {
  threadId: string;
  turnId: string;
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
  const threadId = v5(
    `${senderKey}:${workspaceMemberId}:${threadKey}`,
    INBOX_MESSAGE_ID_NAMESPACE,
  );
  const messageId = v5(
    `${threadId}:message:${idempotencyKey}`,
    INBOX_MESSAGE_ID_NAMESPACE,
  );

  // Every message the application sends shares one turn.
  return {
    threadId,
    messageId,
    toolCallId: `call_${messageId.replace(/-/g, '')}`,
    turnId: v5(`${threadId}:turn`, INBOX_MESSAGE_ID_NAMESPACE),
  };
};
