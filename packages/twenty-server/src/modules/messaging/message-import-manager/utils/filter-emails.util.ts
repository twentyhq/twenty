import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { filterOutBlocklistedMessages } from 'src/modules/messaging/message-import-manager/utils/filter-out-blocklisted-messages.util';
import { filterOutIcsAttachments } from 'src/modules/messaging/message-import-manager/utils/filter-out-ics-attachments.util';
import { filterOutInternals } from 'src/modules/messaging/message-import-manager/utils/filter-out-internals.util';
import { isGroupEmail } from 'src/modules/messaging/message-import-manager/utils/is-group-email';
import { isMessageSenderMatchingHandles } from 'src/modules/messaging/message-import-manager/utils/is-message-sender-matching-handles.util';
import { isWorkEmail } from 'src/utils/is-work-email';

export const filterEmails = (
  primaryHandle: string,
  handleAliases: string[],
  messages: MessageWithParticipants[],
  blocklist: string[],
  excludeGroupEmails: boolean = true,
) => {
  const messagesWithoutIcsAttachments = filterOutIcsAttachments(messages);

  const messagesWithoutBlocklisted = filterOutBlocklistedMessages(
    [primaryHandle, ...handleAliases],
    messagesWithoutIcsAttachments,
    blocklist,
  );

  const messagesWithoutInternals = isWorkEmail(primaryHandle)
    ? filterOutInternals(primaryHandle, messagesWithoutBlocklisted)
    : messagesWithoutBlocklisted;

  if (!excludeGroupEmails) {
    return messagesWithoutInternals;
  }

  const userHandles = [primaryHandle, ...handleAliases];

  return messagesWithoutInternals.filter((message) => {
    const isSentByUser = isMessageSenderMatchingHandles(message, userHandles);

    if (isSentByUser) {
      return true;
    }

    const senderHandle = message.participants?.find(
      (participant) => participant.role === MessageParticipantRole.FROM,
    )?.handle;

    if (!isDefined(senderHandle)) {
      return true;
    }

    const isSenderGroupEmail = isGroupEmail(senderHandle);

    if (!isSenderGroupEmail) {
      return true;
    }

    return false;
  });
};
