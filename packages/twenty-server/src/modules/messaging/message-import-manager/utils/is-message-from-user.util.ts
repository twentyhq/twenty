import { MessageParticipantRole } from 'twenty-shared/types';

import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export const isMessageFromUser = (
  message: MessageWithParticipants,
  userHandles: string[],
): boolean => {
  const fromParticipant = message.participants?.find(
    (participant) => participant.role === MessageParticipantRole.FROM,
  );

  if (!fromParticipant?.handle) {
    return false;
  }

  const normalizedUserHandles = userHandles.map((handle) =>
    handle.toLowerCase(),
  );

  return normalizedUserHandles.includes(fromParticipant.handle.toLowerCase());
};
