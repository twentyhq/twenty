import { isDefined } from 'twenty-shared/utils';
import { v4 as uuid } from 'uuid';

import { type CalendarEventParticipantSaveOperations } from 'src/modules/calendar/calendar-event-participant-manager/types/calendar-event-participant-save-operations.type';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type FetchedParticipantWithCalendarEventId } from 'src/modules/calendar/common/types/fetched-participant-with-calendar-event-id.type';

const buildParticipantKey = ({
  calendarEventId,
  handle,
}: {
  calendarEventId: string | null;
  handle: string | null;
}): string => `${calendarEventId}:${handle}`;

const hasParticipantChanged = ({
  existingParticipant,
  fetchedParticipant,
}: {
  existingParticipant: CalendarEventParticipantWorkspaceEntity;
  fetchedParticipant: FetchedParticipantWithCalendarEventId;
}): boolean =>
  (existingParticipant.displayName ?? '') !==
    (fetchedParticipant.displayName ?? '') ||
  (existingParticipant.responseStatus ?? '') !==
    (fetchedParticipant.responseStatus ?? '') ||
  existingParticipant.isOrganizer !== fetchedParticipant.isOrganizer;

export const buildCalendarEventParticipantSaveOperations = ({
  fetchedParticipants,
  existingParticipants,
  shouldSkipUnchangedParticipants,
}: {
  fetchedParticipants: FetchedParticipantWithCalendarEventId[];
  existingParticipants: CalendarEventParticipantWorkspaceEntity[];
  shouldSkipUnchangedParticipants: boolean;
}): CalendarEventParticipantSaveOperations => {
  const existingParticipantByKey = new Map<
    string,
    CalendarEventParticipantWorkspaceEntity
  >();

  for (const existingParticipant of existingParticipants) {
    const participantKey = buildParticipantKey(existingParticipant);

    if (existingParticipantByKey.has(participantKey)) {
      continue;
    }

    existingParticipantByKey.set(participantKey, existingParticipant);
  }

  const operations: CalendarEventParticipantSaveOperations = {
    participantsToInsert: [],
    participantsToUpdate: [],
    participantIdsToDelete: [],
  };

  for (const fetchedParticipant of fetchedParticipants) {
    const existingParticipant = existingParticipantByKey.get(
      buildParticipantKey(fetchedParticipant),
    );

    if (!isDefined(existingParticipant)) {
      operations.participantsToInsert.push({
        ...fetchedParticipant,
        id: uuid(),
      });

      continue;
    }

    if (
      shouldSkipUnchangedParticipants &&
      !hasParticipantChanged({ existingParticipant, fetchedParticipant })
    ) {
      continue;
    }

    operations.participantsToUpdate.push({
      criteria: existingParticipant.id,
      partialEntity: fetchedParticipant,
    });
  }

  const fetchedParticipantKeys = new Set(
    fetchedParticipants.map(buildParticipantKey),
  );

  for (const existingParticipant of existingParticipants) {
    if (fetchedParticipantKeys.has(buildParticipantKey(existingParticipant))) {
      continue;
    }

    operations.participantIdsToDelete.push(existingParticipant.id);
  }

  return operations;
};
