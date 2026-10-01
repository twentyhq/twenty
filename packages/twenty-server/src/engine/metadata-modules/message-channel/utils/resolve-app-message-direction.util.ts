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

  // providers may spell the same account with different casing across payloads
  return sender?.handle.toLowerCase() === channelHandle.toLowerCase()
    ? MessageDirection.OUTGOING
    : MessageDirection.INCOMING;
};
