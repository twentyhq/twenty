import { GmailMessage } from 'src/modules/messaging/types/gmail-message';
import { isEmailBlocklisted } from 'src/modules/calendar-messaging-participant/utils/is-email-blocklisted.util';

// Todo: refactor this into several utils
export const filterEmails = (messages: GmailMessage[], blocklist: string[]) => {
  return filterOutBlocklistedMessages(
    filterOutIcsAttachments(filterOutNonPersonalEmails(messages)),
    blocklist,
  );
};

const filterOutBlocklistedMessages = (
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

const isPersonEmail = (email: string): boolean => {
  const nonPersonalPattern =
    /noreply|no-reply|do_not_reply|no\.reply|^(info@|contact@|hello@|support@|feedback@|service@|help@|invites@|invite@|welcome@|alerts@|team@)/;

  return !nonPersonalPattern.test(email);
};

const filterOutNonPersonalEmails = (messages: GmailMessage[]) => {
  return messages.filter((message) => {
    if (!message.participants) {
      return true;
    }

    return message.participants.every((participant) =>
      isPersonEmail(participant.handle),
    );
  });
};
