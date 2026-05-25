import { isNonEmptyString } from '@sniptt/guards';

import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export const groupGmailMessagesBySyncedThread = (
  fetchedMessages: MessageWithParticipants[],
  syncedMessages: MessageWithParticipants[],
): MessageWithParticipants[] => {
  const syncedThreadExternalIds = new Set(
    syncedMessages
      .map((message) => message.messageThreadExternalId)
      .filter(isNonEmptyString),
  );

  return fetchedMessages.filter((message) =>
    syncedThreadExternalIds.has(message.messageThreadExternalId),
  );
};
