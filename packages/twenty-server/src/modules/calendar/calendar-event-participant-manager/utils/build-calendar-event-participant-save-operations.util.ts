import { v4 as uuid } from 'uuid';

import { type CalendarEventParticipantSaveOperations } from 'src/modules/calendar/calendar-event-participant-manager/types/calendar-event-participant-save-operations.type';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type FetchedParticipantWithCalendarEventId } from 'src/modules/calendar/common/types/fetched-participant-with-calendar-event-id.type';

const getParticipantKey = ({
  calendarEventId,
  handle,
}: {
  calendarEventId: string | null;
  handle: string | null;
}): string => `${calendarEventId}:${handle}`;

export const buildCalendarEventParticipantSaveOperations = ({
  participantsOfNewEvents,
  participantsOfExistingEvents,
  existingParticipants,
}: {
  participantsOfNewEvents: FetchedParticipantWithCalendarEventId[];
  participantsOfExistingEvents: FetchedParticipantWithCalendarEventId[];
  existingParticipants: CalendarEventParticipantWorkspaceEntity[];
}): CalendarEventParticipantSaveOperations => {
  const existingParticipantByKey = new Map<
    string,
    CalendarEventParticipantWorkspaceEntity
  >();

  for (const existingParticipant of existingParticipants) {
    const key = getParticipantKey(existingParticipant);

    if (!existingParticipantByKey.has(key)) {
      existingParticipantByKey.set(key, existingParticipant);
    }
  }

  const fetchedParticipantKeys = new Set(
    participantsOfExistingEvents.map(getParticipantKey),
  );

  const operations: CalendarEventParticipantSaveOperations = {
    participantsToInsert: participantsOfNewEvents.map((participant) => ({
      ...participant,
      id: uuid(),
    })),
    participantsToUpdate: [],
    participantIdsToDelete: [],
  };

  for (const participant of participantsOfExistingEvents) {
    const existingParticipant = existingParticipantByKey.get(
      getParticipantKey(participant),
    );

    if (existingParticipant) {
      operations.participantsToUpdate.push({
        criteria: existingParticipant.id,
        partialEntity: participant,
      });

      continue;
    }

    operations.participantsToInsert.push({ ...participant, id: uuid() });
  }

  for (const existingParticipant of existingParticipants) {
    if (!fetchedParticipantKeys.has(getParticipantKey(existingParticipant))) {
      operations.participantIdsToDelete.push(existingParticipant.id);
    }
  }

  return operations;
};
