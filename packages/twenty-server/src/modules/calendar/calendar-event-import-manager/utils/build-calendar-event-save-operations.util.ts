import { v4 as uuid } from 'uuid';

import { type CalendarEventSavePlan } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-save-plan.type';
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
}): CalendarEventSavePlan => {
  const associationByEventExternalId = new Map(
    existingAssociations.map((association) => [
      association.eventExternalId,
      association,
    ]),
  );

  const plan: CalendarEventSavePlan = {
    saveOperations: {
      calendarEventsToInsert: [],
      calendarEventsToUpdate: [],
      associationsToInsert: [],
      associationsToUpdate: [],
    },
    participantsOfNewEvents: [],
    participantsOfExistingEvents: [],
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

      plan.saveOperations.calendarEventsToUpdate.push({
        criteria: calendarEventId,
        partialEntity: calendarEventFields,
      });

      plan.saveOperations.associationsToUpdate.push({
        criteria: existingAssociation.id,
        partialEntity: { recurringEventExternalId },
      });

      for (const participant of fetchedCalendarEvent.participants) {
        plan.participantsOfExistingEvents.push({
          ...participant,
          calendarEventId,
        });
      }

      continue;
    }

    const calendarEventId = uuid();

    plan.saveOperations.calendarEventsToInsert.push({
      id: calendarEventId,
      ...calendarEventFields,
    });

    plan.saveOperations.associationsToInsert.push({
      calendarEventId,
      eventExternalId: fetchedCalendarEvent.id,
      calendarChannelId,
      recurringEventExternalId,
    });

    for (const participant of fetchedCalendarEvent.participants) {
      plan.participantsOfNewEvents.push({
        ...participant,
        calendarEventId,
      });
    }
  }

  return plan;
};
