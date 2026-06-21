import { isDefined } from 'twenty-shared/utils';

import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { getDomainFromEmailOrThrow } from 'src/utils/get-domain-from-email-or-throw';

export const filterOutInternals = (
  primaryHandle: string,
  messages: MessageWithParticipants[],
) => {
  return messages.filter((message) => {
    if (!message.participants) {
      return true;
    }

    const primaryHandleDomain = getDomainFromEmailOrThrow(primaryHandle);

    try {
      const isAllHandlesFromSameDomain = message.participants
        .filter((participant) => isDefined(participant.handle))
        .every(
          (participant) =>
            isDefined(participant.handle) &&
            getDomainFromEmailOrThrow(participant.handle) ===
              primaryHandleDomain,
        );

      if (isAllHandlesFromSameDomain) {
        return false;
      }
    } catch {
      return true;
    }

    return true;
  });
};
