import { MessageParticipantRole } from 'twenty-shared/types';

import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

export const resolveAppMessageDirection = ({
  participants,
  channelHandle,
}: {
  participants: { role: MessageParticipantRole; handle: string }[];
  channelHandle: string;
}): MessageDirection => {
  const sender = participants.find(
    (participant) => participant.role === MessageParticipantRole.FROM,
  );

  // case-insensitive like the email path: a provider casing the account differently across APIs would make every sent message incoming
  return sender?.handle.toLowerCase() === channelHandle.toLowerCase()
    ? MessageDirection.OUTGOING
    : MessageDirection.INCOMING;
};
