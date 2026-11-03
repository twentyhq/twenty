import { buildInboxMessageRecordIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-record-ids.util';

type InboxThreadMessageIds = {
  threadId: string;
  turnId: string;
  messageId: string;
  toolCallId: string;
  openingMessageId: null;
};

// Scoped to the sender, so two senders reusing an idempotency key write separate messages
export const buildInboxThreadMessageIds = ({
  threadId,
  senderScope,
  idempotencyKey,
}: {
  threadId: string;
  senderScope: string;
  idempotencyKey: string;
}): InboxThreadMessageIds => {
  return {
    threadId,
    ...buildInboxMessageRecordIds({
      threadIdentity: `${threadId}:${senderScope}`,
      idempotencyKey,
    }),
    openingMessageId: null,
  };
};
