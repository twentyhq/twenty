import { Participant } from 'src/workspace/messaging/types/gmail-message';

export function getUniqueParticipantsAndHandles(participants: Participant[]): {
  uniqueParticipants: Participant[];
  uniqueHandles: string[];
} {
  if (participants.length === 0) {
    return { uniqueParticipants: [], uniqueHandles: [] };
  }

  const uniqueHandles = Array.from(
    new Set(participants.map((participant) => participant.handle)),
  );

  const uniqueParticipants = uniqueHandles.map((handle) => {
    const participant = participants.find(
      (participant) => participant.handle === handle,
    );

    return participant;
  }) as Participant[];

  return { uniqueParticipants, uniqueHandles };
}
