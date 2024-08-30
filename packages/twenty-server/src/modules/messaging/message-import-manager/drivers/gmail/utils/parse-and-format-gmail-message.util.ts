import { gmail_v1 as gmailV1 } from 'googleapis';
import planer from 'planer';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { parseGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/sanitize-string.util';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';

export const parseAndFormatGmailMessage = (
  message: gmailV1.Schema$Message,
  connectedAccount: Pick<
    ConnectedAccountWorkspaceEntity,
    'handle' | 'handleAliases'
  >,
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
    receivedAt: new Date(parseInt(internalDate)),
    direction: computeMessageDirection(from[0].address || '', connectedAccount),
    participants,
    text: sanitizeString(textWithoutReplyQuotations),
    attachments,
  };
};
