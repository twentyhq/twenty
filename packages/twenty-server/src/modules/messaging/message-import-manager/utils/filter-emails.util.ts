import { isEmailBlocklisted } from 'src/modules/calendar-messaging-participant/utils/is-email-blocklisted.util';
import { GmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message';
import { isWorkEmail } from 'src/utils/is-work-email';

// Todo: refactor this into several utils
export const filterEmails = (
  messageChannelHandle: string,
  messages: GmailMessage[],
  excludeGroupEmails: boolean,
  excludeNonProfessionalEmails: boolean,
  blocklist: string[],
) => {
  let filteredMessages = filterOutBlocklistedMessages(
    messageChannelHandle,
    filterOutIcsAttachments(messages),
    blocklist,
  );

  if (excludeGroupEmails) {
    filteredMessages = filterOutGroupEmails(filteredMessages);
  }

  if (excludeNonProfessionalEmails) {
    filteredMessages = filterOutNonProfessionlEmails(filteredMessages);
  }

  return filteredMessages;
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

const isGroupEmail = (email: string): boolean => {
  const nonPersonalPattern =
    /noreply|no-reply|do_not_reply|no\.reply|^(info@|contact@|hello@|support@|feedback@|service@|help@|invites@|invite@|welcome@|alerts@|team@|notifications@|notification@|news@)/;

  return nonPersonalPattern.test(email);
};

const filterOutGroupEmails = (messages: GmailMessage[]) => {
  return messages.filter((message) => {
    if (!message.participants) {
      return true;
    }

    return message.participants.every(
      (participant) => !isGroupEmail(participant.handle),
    );
  });
};

const filterOutNonProfessionlEmails = (messages: GmailMessage[]) => {
  return messages.filter((message) => {
    if (!message.participants) {
      return true;
    }

    return message.participants.every((participant) =>
      isWorkEmail(participant.handle),
    );
  });
};
