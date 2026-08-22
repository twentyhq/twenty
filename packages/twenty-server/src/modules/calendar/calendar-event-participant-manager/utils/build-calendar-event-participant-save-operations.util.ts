import { v4 as uuid } from 'uuid';

import { type CalendarEventParticipantSaveOperations } from 'src/modules/calendar/calendar-event-participant-manager/types/calendar-event-participant-save-operations';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type FetchedCalendarEventParticipant } from 'src/modules/calendar/common/types/fetched-calendar-event';

type FetchedParticipantWithCalendarEventId = FetchedCalendarEventParticipant & {
  calendarEventId: string;
};

const getParticipantKey = ({
  calendarEventId,
  handle,
}: {
  calendarEventId: string | null;
  handle: string | null;
}): string => `${calendarEventId}:${handle}`;

export const buildCalendarEventParticipantSaveOperations = ({
  participantsToCreate,
  participantsToUpdate,
  existingParticipants,
}: {
  participantsToCreate: FetchedParticipantWithCalendarEventId[];
  participantsToUpdate: FetchedParticipantWithCalendarEventId[];
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
    participantsToUpdate.map(getParticipantKey),
  );

  const operations: CalendarEventParticipantSaveOperations = {
    participantsToInsert: participantsToCreate.map((participant) => ({
      ...participant,
      id: uuid(),
    })),
    participantsToUpdate: [],
    participantIdsToDelete: [],
  };

  for (const participant of participantsToUpdate) {
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
