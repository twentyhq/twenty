import { MessageParticipantRole } from 'twenty-shared/types';

import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { isGroupEmail } from 'src/modules/messaging/message-import-manager/utils/is-group-email';

export const filterOutGroupEmails = (messages: MessageWithParticipants[]) => {
  return messages.filter((message) => {
    if (!message.participants) {
      return true;
    }

    const fromParticipant = message.participants.find(
      (participant) => participant.role === MessageParticipantRole.FROM,
    );

    if (!fromParticipant || !fromParticipant.handle) {
      return true;
    }

    return !isGroupEmail(fromParticipant.handle);
  });
};
