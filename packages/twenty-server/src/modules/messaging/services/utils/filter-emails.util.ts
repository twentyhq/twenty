import { GmailMessage } from 'src/modules/messaging/types/gmail-message';
import { isEmailBlocklisted } from 'src/modules/calendar-messaging-participant/utils/is-email-blocklisted.util';

export const filterEmails = (messages: GmailMessage[], blocklist: string[]) => {
  return filterOutBlocklistedMessages(
    filterOutIcsAttachments(messages),
    blocklist,
  );
};

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

export const filterOutIcsAttachments = (messages: GmailMessage[]) => {
  return messages.filter((message) => {
    if (!message.attachments) {
      return true;
    }

    return message.attachments.every(
      (attachment) => !attachment.filename.endsWith('.ics'),
    );
  });
};
