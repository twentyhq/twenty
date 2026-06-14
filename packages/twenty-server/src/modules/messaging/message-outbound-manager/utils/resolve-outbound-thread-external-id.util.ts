import { isNonEmptyString } from '@sniptt/guards';

import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

export const resolveOutboundThreadExternalId = ({
  sendResult,
  parentThreadExternalId,
  inReplyTo,
}: {
  sendResult: SendMessageResult;
  parentThreadExternalId?: string;
  inReplyTo?: string;
}): string => {
  if (isNonEmptyString(sendResult.threadExternalId)) {
    return sendResult.threadExternalId;
  }

  // IMAP/SMTP: anchor on parent's thread id so replies stay in the original thread.
  if (isNonEmptyString(parentThreadExternalId)) {
    return parentThreadExternalId;
  }

  if (isNonEmptyString(inReplyTo)) {
    return inReplyTo;
  }

  // New IMAP/SMTP send: own Message-ID is unique per RFC822, so unrelated
  // sends never collide on a shared empty thread key.
  return sendResult.headerMessageId;
};
