import { isEmailBlocklisted } from 'src/modules/blocklist/utils/is-email-blocklisted.util';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { isWorkEmail } from 'src/utils/is-work-email';

// Todo: refactor this into several utils
export const filterEmails = (
  primaryHandle: string,
  handleAliases: string[],
  messages: MessageWithParticipants[],
  blocklist: string[],
) => {
  const messagesWithoutBlocklisted = filterOutBlocklistedMessages(
    [primaryHandle, ...handleAliases],
    filterOutIcsAttachments(messages),
    blocklist,
  );

  if (isWorkEmail(primaryHandle)) {
    return filterOutInternals(primaryHandle, messagesWithoutBlocklisted);
  }

  return messagesWithoutBlocklisted;
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

const filterOutInternals = (
  primaryHandle: string,
  messages: MessageWithParticipants[],
) => {
  return messages.filter((message) => {
    if (!message.participants) {
      return true;
    }

    const primaryHandleDomain = getDomainNameByEmail(primaryHandle);
    const isAllHandlesFromSameDomain = message.participants
      .filter((participant) => !!participant.handle)
      .every(
        (participant) =>
          getDomainNameByEmail(participant.handle) === primaryHandleDomain,
      );

    if (isAllHandlesFromSameDomain) {
      return false;
    }

    return true;
  });
};
