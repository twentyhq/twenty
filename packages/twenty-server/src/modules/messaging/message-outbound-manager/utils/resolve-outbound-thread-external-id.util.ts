import { isNonEmptyString } from '@sniptt/guards';

import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

export const resolveOutboundThreadExternalId = ({
  sendResult,
  inReplyTo,
}: {
  sendResult: SendMessageResult;
  inReplyTo?: string;
}): string => {
  if (isNonEmptyString(sendResult.threadExternalId)) {
    return sendResult.threadExternalId;
  }

  // IMAP/SMTP have no server-side thread id. Reuse the parent's Message-ID so
  // the reply attaches to the same thread the parent stored under.
  if (isNonEmptyString(inReplyTo)) {
    return inReplyTo;
  }

  // New IMAP/SMTP send: own Message-ID is unique per RFC822, so unrelated
  // sends never collide on a shared empty thread key.
  return sendResult.headerMessageId;
};
