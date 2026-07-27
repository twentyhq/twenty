import { type gmail_v1 as gmailV1 } from 'googleapis';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { parseGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { buildReplyToParticipants } from 'src/modules/messaging/message-import-manager/utils/build-reply-to-participants.util';
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
    messageHeaders,
  } = parseGmailMessage(message);

  const isDraft = (labelIds ?? []).includes('DRAFT');

  // Gmail may omit the Message-ID header on drafts; synthesize a stable id from
  // the message id so drafts aren't dropped.
  const resolvedHeaderMessageId =
    headerMessageId ?? (isDraft ? `draft-${id}` : undefined);

  if (
    !isDefined(from) ||
    !isDefined(resolvedHeaderMessageId) ||
    !isDefined(threadId)
  ) {
    return null;
  }

  const toParticipants = isNonEmptyArray(to)
    ? to
    : isNonEmptyString(deliveredTo)
      ? [{ address: deliveredTo }]
      : [];

  const participants = [
    ...formatAddressObjectAsParticipants([from], MessageParticipantRole.FROM),
    ...buildReplyToParticipants(replyTo, from),
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

  if (!hasRecipientParticipant && !isDraft) {
    return null;
  }

  return {
    externalId: id,
    headerMessageId: resolvedHeaderMessageId,
    subject: subject || '',
    messageThreadExternalId: threadId,
    receivedAt: new Date(parseInt(internalDate)),
    direction: computeMessageDirection(from.address || '', connectedAccount),
    participants,
    text: extractMessageBodyText(isHtml ? { html: body } : { text: body }),
    attachments,
    messageFolderExternalIds: labelIds,
    labelIds,
    isDraft,
    messageHeaders,
  };
};
