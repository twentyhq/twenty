import { gmail_v1 as gmailV1 } from 'googleapis';
import planer from 'planer';

import { parseGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/sanitize-string.util';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { isDefined } from 'src/utils/is-defined';

export const parseAndFormatGmailMessages = (
  messages: gmailV1.Schema$Message[],
): MessageWithParticipants[] => {
  return messages.map(parseAndFormatGmailMessage).filter(isDefined);
};

export const parseAndFormatGmailMessage = (
  message: gmailV1.Schema$Message,
): MessageWithParticipants | null => {
  const {
    id,
    threadId,
    internalDate,
    subject,
    from,
    to,
    cc,
    bcc,
    headerMessageId,
    text,
    attachments,
    deliveredTo,
  } = parseGmailMessage(message);

  if (
    !from ||
    (!to && !deliveredTo && !bcc && !cc) ||
    !headerMessageId ||
    !threadId
  ) {
    return null;
  }

  const participants = [
    ...formatAddressObjectAsParticipants(from, 'from'),
    ...formatAddressObjectAsParticipants(to ?? deliveredTo, 'to'),
    ...formatAddressObjectAsParticipants(cc, 'cc'),
    ...formatAddressObjectAsParticipants(bcc, 'bcc'),
  ];

  const textWithoutReplyQuotations = text
    ? planer.extractFrom(text, 'text/plain')
    : '';

  return {
    externalId: id,
    headerMessageId,
    subject: subject || '',
    messageThreadExternalId: threadId,
    receivedAt: new Date(internalDate),
    fromHandle: from[0].address || '',
    participants,
    text: sanitizeString(textWithoutReplyQuotations),
    attachments,
  };
};
