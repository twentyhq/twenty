import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { AUTO_GENERATED_BODY_MARKER } from 'src/modules/messaging/message-import-manager/constants/auto-generated-body-marker.constant';
import { RECIPIENT_ROLES } from 'src/modules/messaging/message-import-manager/constants/recipient-roles.constant';
import { UNSUBSCRIBE_COMMAND_SUBJECT } from 'src/modules/messaging/message-import-manager/constants/unsubscribe-command-subject.constant';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { isBulkMail } from 'src/modules/messaging/message-import-manager/utils/is-bulk-mail.util';
import { isUnsubscribeEmail } from 'src/modules/messaging/message-import-manager/utils/is-unsubscribe-email.util';

export const filterOutUnsubscribeRequests = (
  messageChannelHandles: string[],
  messages: MessageWithParticipants[],
) => {
  const ownHandles = messageChannelHandles.map((handle) =>
    handle.toLowerCase(),
  );

  return messages.filter((message) => {
    if (!isDefined(message.participants)) {
      return true;
    }

    const counterpartyHandles = message.participants
      .map((participant) => participant.handle?.toLowerCase())
      .filter(isNonEmptyString)
      .filter((handle) => !ownHandles.includes(handle));

    if (!isNonEmptyArray(counterpartyHandles)) {
      return true;
    }

    if (counterpartyHandles.every(isUnsubscribeEmail)) {
      return false;
    }

    const counterpartyRecipients = message.participants.filter(
      (participant) =>
        RECIPIENT_ROLES.includes(participant.role) &&
        isNonEmptyString(participant.handle) &&
        !ownHandles.includes(participant.handle.toLowerCase()),
    );

    const counterpartyRecipientHandles = new Set(
      counterpartyRecipients
        .map((participant) => participant.handle?.toLowerCase())
        .filter(isNonEmptyString),
    );

    const messageText = message.text?.trim().toLowerCase() ?? '';

    const isAutomatedMessage =
      isBulkMail(message.messageHeaders ?? []) ||
      messageText === '' ||
      messageText === UNSUBSCRIBE_COMMAND_SUBJECT ||
      messageText.includes(AUTO_GENERATED_BODY_MARKER);

    const isUnsubscribeCommandToSingleRecipient =
      message.direction === MessageDirection.OUTGOING &&
      counterpartyRecipientHandles.size === 1 &&
      isAutomatedMessage &&
      message.subject?.trim().toLowerCase() === UNSUBSCRIBE_COMMAND_SUBJECT;

    return !isUnsubscribeCommandToSingleRecipient;
  });
};
