import { MessageParticipantRole } from 'twenty-shared/types';

import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

// Derived rather than taken from the app: direction is a property of who sent
// the message relative to this channel, which the server already knows, and
// an app that got it backwards would mislabel every thread it ingests.
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

  return sender?.handle === channelHandle
    ? MessageDirection.OUTGOING
    : MessageDirection.INCOMING;
};
