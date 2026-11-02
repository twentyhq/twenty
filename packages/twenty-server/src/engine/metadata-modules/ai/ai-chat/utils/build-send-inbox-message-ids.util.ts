import { type InboxMessageAddressing } from 'src/engine/metadata-modules/ai/ai-chat/types/inbox-message-addressing.type';
import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';
import { buildInboxThreadMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-thread-message-ids.util';

export const buildSendInboxMessageIds = ({
  addressing,
  senderKey,
  idempotencyKey,
}: {
  addressing: InboxMessageAddressing;
  senderKey: string;
  idempotencyKey: string;
}) => {
  if ('threadKey' in addressing) {
    return buildInboxMessageIds({
      senderKey,
      threadKey: addressing.threadKey,
      idempotencyKey,
    });
  }

  return buildInboxThreadMessageIds({
    threadId: addressing.threadId,
    senderScope: senderKey,
    idempotencyKey,
  });
};
