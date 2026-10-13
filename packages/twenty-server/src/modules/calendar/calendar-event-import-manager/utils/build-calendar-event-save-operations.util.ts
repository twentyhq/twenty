import { isDefined } from 'twenty-shared/utils';
import { v4 as uuid } from 'uuid';

import { type CalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-save-operations.type';
import { type CalendarEventSavePlan } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-save-plan.type';
import {
  type ComparableCalendarEvent,
  hasCalendarEventChanged,
} from 'src/modules/calendar/calendar-event-import-manager/utils/has-calendar-event-changed.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';
import { type FetchedParticipantWithCalendarEventId } from 'src/modules/calendar/common/types/fetched-participant-with-calendar-event-id.type';

export const buildCalendarEventSaveOperations = ({
  fetchedCalendarEvents,
  existingAssociations,
  existingCalendarEvents,
  calendarChannelId,
  calendarEventIdSharedByEventExternalId = new Map(),
}: {
  fetchedCalendarEvents: FetchedCalendarEvent[];
  existingAssociations: CalendarChannelEventAssociationWorkspaceEntity[];
  existingCalendarEvents: ComparableCalendarEvent[];
  calendarChannelId: string;
  calendarEventIdSharedByEventExternalId?: Map<string, string>;
}): CalendarEventSavePlan => {
  const existingAssociationByEventExternalId = new Map(
    existingAssociations.map((association) => [
      association.eventExternalId,
      association,
    ]),
  );
  const existingCalendarEventById = new Map(
    existingCalendarEvents.map((calendarEvent) => [
      calendarEvent.id,
      calendarEvent,
    ]),
  );

  const saveOperations: CalendarEventSaveOperations = {
    calendarEventsToInsert: [],
    calendarEventsToUpdate: [],
    associationsToInsert: [],
    associationsToUpdate: [],
  };
  const existingCalendarEventIds: string[] = [];
  const participantsOfNewEvents: FetchedParticipantWithCalendarEventId[] = [];
  const participantsOfExistingEvents: FetchedParticipantWithCalendarEventId[] =
    [];

  for (const fetchedCalendarEvent of fetchedCalendarEvents) {
    const {
      id: eventExternalId,
      participants,
      recurringEventExternalId = '',
    } = fetchedCalendarEvent;

    const calendarEvent = {
      iCalUid: fetchedCalendarEvent.iCalUid,
      title: fetchedCalendarEvent.title,
      description: fetchedCalendarEvent.description,
      startsAt: fetchedCalendarEvent.startsAt,
      endsAt: fetchedCalendarEvent.endsAt,
      location: fetchedCalendarEvent.location,
      isFullDay: fetchedCalendarEvent.isFullDay,
      isCanceled: fetchedCalendarEvent.isCanceled,
      conferenceSolution: fetchedCalendarEvent.conferenceSolution,
      conferenceLink: {
        primaryLinkLabel: fetchedCalendarEvent.conferenceLinkLabel,
        primaryLinkUrl: fetchedCalendarEvent.conferenceLinkUrl,
        secondaryLinks: [],
      },
      externalCreatedAt: fetchedCalendarEvent.externalCreatedAt,
      externalUpdatedAt: fetchedCalendarEvent.externalUpdatedAt,
    };

    const existingAssociation =
      existingAssociationByEventExternalId.get(eventExternalId);
    const storedCalendarEventId =
      existingAssociation?.calendarEventId ??
      calendarEventIdSharedByEventExternalId.get(eventExternalId);

    if (isDefined(storedCalendarEventId)) {
      const existingCalendarEvent = existingCalendarEventById.get(
        storedCalendarEventId,
      );

      if (
        !isDefined(existingCalendarEvent) ||
        hasCalendarEventChanged({ existingCalendarEvent, calendarEvent })
      ) {
        saveOperations.calendarEventsToUpdate.push({
          criteria: storedCalendarEventId,
          partialEntity: calendarEvent,
        });
      }

      participantsOfExistingEvents.push(
        ...participants.map((participant) => ({
          ...participant,
          calendarEventId: storedCalendarEventId,
        })),
      );

      if (!isDefined(existingAssociation)) {
        saveOperations.associationsToInsert.push({
          calendarEventId: storedCalendarEventId,
          eventExternalId,
          calendarChannelId,
          recurringEventExternalId,
        });

        continue;
      }

      existingCalendarEventIds.push(storedCalendarEventId);

      if (
        !isDefined(existingCalendarEvent) ||
        (existingAssociation.recurringEventExternalId ?? '') !==
          recurringEventExternalId
      ) {
        saveOperations.associationsToUpdate.push({
          criteria: existingAssociation.id,
          partialEntity: { recurringEventExternalId },
        });
      }

      continue;
    }

    const calendarEventId = uuid();

    saveOperations.calendarEventsToInsert.push({
      id: calendarEventId,
      ...calendarEvent,
    });
    saveOperations.associationsToInsert.push({
      calendarEventId,
      eventExternalId,
      calendarChannelId,
      recurringEventExternalId,
    });
    participantsOfNewEvents.push(
      ...participants.map((participant) => ({
        ...participant,
        calendarEventId,
      })),
    );
  }

  return {
    saveOperations,
    existingCalendarEventIds,
    participantsOfNewEvents,
    participantsOfExistingEvents,
  };
};
