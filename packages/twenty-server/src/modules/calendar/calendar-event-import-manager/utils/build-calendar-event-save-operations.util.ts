import { v4 as uuid } from 'uuid';

import { type CalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-save-operations';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const buildCalendarEventSaveOperations = ({
  fetchedCalendarEvents,
  existingAssociations,
  calendarChannelId,
}: {
  fetchedCalendarEvents: FetchedCalendarEvent[];
  existingAssociations: CalendarChannelEventAssociationWorkspaceEntity[];
  calendarChannelId: string;
}): CalendarEventSaveOperations => {
  const associationByEventExternalId = new Map(
    existingAssociations.map((association) => [
      association.eventExternalId,
      association,
    ]),
  );

  const operations: CalendarEventSaveOperations = {
    calendarEventsToInsert: [],
    calendarEventsToUpdate: [],
    associationsToInsert: [],
    associationsToUpdate: [],
    participantsToCreate: [],
    participantsToUpdate: [],
  };

  for (const fetchedCalendarEvent of fetchedCalendarEvents) {
    const calendarEventFields = {
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

    const recurringEventExternalId =
      fetchedCalendarEvent.recurringEventExternalId ?? '';

    const existingAssociation = associationByEventExternalId.get(
      fetchedCalendarEvent.id,
    );

    if (existingAssociation) {
      const calendarEventId = existingAssociation.calendarEventId;

      operations.calendarEventsToUpdate.push({
        criteria: calendarEventId,
        partialEntity: calendarEventFields,
      });

      operations.associationsToUpdate.push({
        criteria: existingAssociation.id,
        partialEntity: { recurringEventExternalId },
      });

      for (const participant of fetchedCalendarEvent.participants) {
        operations.participantsToUpdate.push({
          ...participant,
          calendarEventId,
        });
      }

      continue;
    }

    const calendarEventId = uuid();

    operations.calendarEventsToInsert.push({
      id: calendarEventId,
      ...calendarEventFields,
    });

    operations.associationsToInsert.push({
      calendarEventId,
      eventExternalId: fetchedCalendarEvent.id,
      calendarChannelId,
      recurringEventExternalId,
    });

    for (const participant of fetchedCalendarEvent.participants) {
      operations.participantsToCreate.push({
        ...participant,
        calendarEventId,
      });
    }
  }

  return operations;
};
