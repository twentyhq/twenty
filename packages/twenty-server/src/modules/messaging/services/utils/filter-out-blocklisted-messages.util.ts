import { isEmailBlocklisted } from 'src/modules/calendar-messaging-participant/utils/is-email-blocklisted.util';
import { GmailMessage } from 'src/modules/messaging/types/gmail-message';

export const filterOutBlocklistedMessages = (
  messages: GmailMessage[],
  blocklist: string[],
) => {
  return messages.filter((message) => {
    if (!message.participants) {
      return true;
    }

    return message.participants.every(
      (participant) => !isEmailBlocklisted(participant.handle, blocklist),
    );
  });
};
