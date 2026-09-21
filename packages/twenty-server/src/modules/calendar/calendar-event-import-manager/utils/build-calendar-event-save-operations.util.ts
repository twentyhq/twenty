import { isDefined } from 'twenty-shared/utils';
import { v4 as uuid } from 'uuid';

import { type CalendarEventSaveOperations } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-save-operations.type';
import { type CalendarEventSavePlan } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-save-plan.type';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { type FetchedParticipantWithCalendarEventId } from 'src/modules/calendar/common/types/fetched-participant-with-calendar-event-id.type';

export const buildCalendarEventSaveOperations = ({
  fetchedCalendarEvents,
  existingAssociations,
  calendarChannelId,
}: {
  fetchedCalendarEvents: FetchedCalendarEvent[];
  existingAssociations: CalendarChannelEventAssociationWorkspaceEntity[];
  calendarChannelId: string;
}): CalendarEventSavePlan => {
  const existingAssociationByEventExternalId = new Map(
    existingAssociations.map((association) => [
      association.eventExternalId,
      association,
    ]),
  );

  const saveOperations: CalendarEventSaveOperations = {
    calendarEventsToInsert: [],
    calendarEventsToUpdate: [],
    associationsToInsert: [],
    associationsToUpdate: [],
  };
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

    if (isDefined(existingAssociation)) {
      const { calendarEventId } = existingAssociation;

      saveOperations.calendarEventsToUpdate.push({
        criteria: calendarEventId,
        partialEntity: calendarEvent,
      });
      saveOperations.associationsToUpdate.push({
        criteria: existingAssociation.id,
        partialEntity: { recurringEventExternalId },
      });
      participantsOfExistingEvents.push(
        ...participants.map((participant) => ({
          ...participant,
          calendarEventId,
        })),
      );

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
    participantsOfNewEvents,
    participantsOfExistingEvents,
  };
};
