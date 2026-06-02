import { type gmail_v1 as gmailV1 } from 'googleapis';
import planer from 'planer';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { parseGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

export const parseAndFormatGmailMessage = (
  message: gmailV1.Schema$Message,
  connectedAccount: Pick<ConnectedAccountEntity, 'handle' | 'handleAliases'>,
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
    labelIds,
  } = parseGmailMessage(message);

  if (!isDefined(from) || !isDefined(headerMessageId) || !isDefined(threadId)) {
    return null;
  }

  const toParticipants = isNonEmptyArray(to)
    ? to
    : isNonEmptyString(deliveredTo)
      ? [{ address: deliveredTo }]
      : [];

  const participants = [
    ...formatAddressObjectAsParticipants([from], MessageParticipantRole.FROM),
    ...formatAddressObjectAsParticipants(
      toParticipants,
      MessageParticipantRole.TO,
    ),
    ...formatAddressObjectAsParticipants(cc, MessageParticipantRole.CC),
    ...formatAddressObjectAsParticipants(bcc, MessageParticipantRole.BCC),
  ];

  const hasRecipientParticipant = participants.some(
    (participant) => participant.role !== MessageParticipantRole.FROM,
  );

  if (!hasRecipientParticipant) {
    return null;
  }

  const textWithoutReplyQuotations = text
    ? planer.extractFrom(text, 'text/plain')
    : '';

  return {
    externalId: id,
    headerMessageId,
    subject: subject || '',
    messageThreadExternalId: threadId,
    receivedAt: new Date(parseInt(internalDate)),
    direction: computeMessageDirection(from.address || '', connectedAccount),
    participants,
    text: sanitizeString(textWithoutReplyQuotations),
    attachments,
    messageFolderExternalIds: labelIds,
    labelIds,
  };
};
