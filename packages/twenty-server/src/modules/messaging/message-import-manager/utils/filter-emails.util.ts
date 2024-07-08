import { isEmailBlocklisted } from 'src/modules/calendar-messaging-participant-manager/utils/is-email-blocklisted.util';
import { GmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message';

// Todo: refactor this into several utils
export const filterEmails = (
  messageChannelHandle: string,
  messages: GmailMessage[],
  blocklist: string[],
) => {
  return filterOutBlocklistedMessages(
    messageChannelHandle,
    filterOutIcsAttachments(messages),
    blocklist,
  );
};

const filterOutBlocklistedMessages = (
  messageChannelHandle: string,
  messages: GmailMessage[],
  blocklist: string[],
) => {
  return messages.filter((message) => {
    if (!message.participants) {
      return true;
    }

    return message.participants.every(
      (participant) =>
        !isEmailBlocklisted(
          messageChannelHandle,
          participant.handle,
          blocklist,
        ),
    );
  });
};

const filterOutIcsAttachments = (messages: GmailMessage[]) => {
  return messages.filter((message) => {
    if (!message.attachments) {
      return true;
    }

    return message.attachments.every(
      (attachment) => !attachment.filename.endsWith('.ics'),
    );
  });
};
