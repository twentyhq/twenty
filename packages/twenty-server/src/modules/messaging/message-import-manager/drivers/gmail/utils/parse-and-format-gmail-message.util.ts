import { type gmail_v1 as gmailV1 } from 'googleapis';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { parseGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { extractMessageBodyText } from 'src/modules/messaging/message-import-manager/utils/extract-message-body-text.util';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';

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
    replyTo,
    to,
    cc,
    bcc,
    headerMessageId,
    body,
    isHtml,
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

  // Relay senders (e.g. a website form sending as wordpress@dude.fi) put the
  // real contact in Reply-To. Add it as a FROM participant so the message links
  // to that person; only surfaces when Reply-To matches an existing contact.
  const replyToParticipants =
    isDefined(replyTo) &&
    isNonEmptyString(replyTo.address) &&
    replyTo.address.toLowerCase() !== (from.address ?? '').toLowerCase()
      ? formatAddressObjectAsParticipants([replyTo], MessageParticipantRole.FROM)
      : [];

  const participants = [
    ...formatAddressObjectAsParticipants([from], MessageParticipantRole.FROM),
    ...replyToParticipants,
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

  return {
    externalId: id,
    headerMessageId,
    subject: subject || '',
    messageThreadExternalId: threadId,
    receivedAt: new Date(parseInt(internalDate)),
    direction: computeMessageDirection(from.address || '', connectedAccount),
    participants,
    text: extractMessageBodyText(isHtml ? { html: body } : { text: body }),
    attachments,
    messageFolderExternalIds: labelIds,
    labelIds,
  };
};
