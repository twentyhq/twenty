import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';
import { buildInboxMessageRecordIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-record-ids.util';
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
  threadKey,
  idempotencyKey,
}: {
  senderKey: string;
  threadKey: string;
  idempotencyKey: string;
}): InboxMessageIds => {
  const threadId = buildInboxThreadId({ senderKey, threadKey });

  // A thread opens with a single context message, so every message the
  // application sends shares the turn that opener starts.
  return {
    threadId,
    ...buildInboxMessageRecordIds({
      threadIdentity: threadId,
      idempotencyKey,
    }),
    openingMessageId: v5(`${threadId}:opening`, INBOX_MESSAGE_ID_NAMESPACE),
  };
};
