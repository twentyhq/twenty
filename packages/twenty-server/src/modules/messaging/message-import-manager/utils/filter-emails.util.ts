import { isEmailBlocklisted } from 'src/modules/blocklist/utils/is-email-blocklisted.util';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

// Todo: refactor this into several utils
export const filterEmails = (
  messageChannelHandles: string[],
  messages: MessageWithParticipants[],
  blocklist: string[],
) => {
  return filterOutBlocklistedMessages(
    messageChannelHandles,
    filterOutIcsAttachments(messages),
    blocklist,
  );
};

const filterOutBlocklistedMessages = (
  messageChannelHandles: string[],
  messages: MessageWithParticipants[],
  blocklist: string[],
) => {
  return messages.filter((message) => {
    if (!message.participants) {
      return true;
    }

    return message.participants.every(
      (participant) =>
        !isEmailBlocklisted(
          messageChannelHandles,
          participant.handle,
          blocklist,
        ),
    );
  });
};

const filterOutIcsAttachments = (messages: MessageWithParticipants[]) => {
  return messages.filter((message) => {
    if (!message.attachments) {
      return true;
    }

    return message.attachments.every(
      (attachment) => !attachment.filename.endsWith('.ics'),
    );
  });
};
