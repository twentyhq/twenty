import _ from 'lodash';

import { Participant } from 'src/workspace/messaging/types/gmail-message';
export function getUniqueParticipantsAndHandles(participants: Participant[]): {
  uniqueParticipants: Participant[];
  uniqueHandles: string[];
} {
  if (participants.length === 0) {
    return { uniqueParticipants: [], uniqueHandles: [] };
  }

  const uniqueHandles = _.uniq(
    participants.map((participant) => participant.handle),
  );

  const uniqueParticipants = _.uniqBy(participants, 'handle');

  return { uniqueParticipants, uniqueHandles };
}
