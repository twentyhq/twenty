import { type gmail_v1 as gmailV1 } from 'googleapis';
import planer from 'planer';
import { MessageParticipantRole } from 'twenty-shared/types';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { parseGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

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

  const toParticipants = to ?? deliveredTo;

  const participants = [
    ...(from
      ? formatAddressObjectAsParticipants(
          [{ address: from }],
          MessageParticipantRole.FROM,
        )
      : []),
    ...(toParticipants
      ? formatAddressObjectAsParticipants(
          [{ address: toParticipants, name: '' }],
          MessageParticipantRole.TO,
        )
      : []),
    ...(cc
      ? formatAddressObjectAsParticipants(
          [{ address: cc }],
          MessageParticipantRole.CC,
        )
      : []),
    ...(bcc
      ? formatAddressObjectAsParticipants(
          [{ address: bcc }],
          MessageParticipantRole.BCC,
        )
      : []),
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
    direction: computeMessageDirection(from || '', connectedAccount),
    participants,
    text: sanitizeString(textWithoutReplyQuotations),
    attachments,
  };
};
