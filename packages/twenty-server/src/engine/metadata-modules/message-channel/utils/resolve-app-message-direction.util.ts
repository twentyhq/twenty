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

  // Compared case-insensitively, as the email path already normalises its
  // handles. A provider that spells the same account differently in its
  // profile API and its message payloads would otherwise mark every message
  // the channel owner sent as incoming. Two distinct handles differing only
  // in case would collide here, but one of them would have to be the
  // channel's own, which is the far smaller risk of the two.
  return sender?.handle.toLowerCase() === channelHandle.toLowerCase()
    ? MessageDirection.OUTGOING
    : MessageDirection.INCOMING;
};
