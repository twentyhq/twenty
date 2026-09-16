import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { isBulkMail } from 'src/modules/messaging/message-import-manager/utils/is-bulk-mail.util';
import { isGroupEmail } from 'src/modules/messaging/message-import-manager/utils/is-group-email';
import { isMessageSenderMatchingHandles } from 'src/modules/messaging/message-import-manager/utils/is-message-sender-matching-handles.util';

export const isExcludedGroupEmailMessage = (
  message: MessageWithParticipants,
  userHandles: string[],
): boolean => {
  if (isMessageSenderMatchingHandles(message, userHandles)) {
    return false;
  }

  if (isBulkMail(message.messageHeaders ?? [])) {
    return true;
  }

  const senderHandle = message.participants?.find(
    (participant) => participant.role === MessageParticipantRole.FROM,
  )?.handle;

  if (!isDefined(senderHandle)) {
    return false;
  }

  return isGroupEmail(senderHandle);
};
