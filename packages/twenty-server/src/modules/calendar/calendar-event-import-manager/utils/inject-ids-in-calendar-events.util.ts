import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import {
  CalendarEventWithParticipants,
  CalendarEventWithParticipantsAndCalendarEventId,
} from 'src/modules/calendar/common/types/calendar-event';

export const existingCalendarEventsMapper = (
  existingCalendarEvents: CalendarEventWorkspaceEntity[],
): Map<string, string> => {
  return new Map<string, string>(
    existingCalendarEvents.map((calendarEvent) => [
      calendarEvent.iCalUID,
      calendarEvent.id,
    ]),
  );
};

export const injectIdsInCalendarEvents = (
  newCalendarEvents: CalendarEventWithParticipants[],
  existingCalendarEvents: CalendarEventWorkspaceEntity[],
): CalendarEventWithParticipantsAndCalendarEventId[] => {
  const iCalUIDCalendarEventIdMap = new Map<string, string>(
    existingCalendarEvents.map((calendarEvent) => [
      calendarEvent.iCalUID,
      calendarEvent.id,
    ]),
  );

  return newCalendarEvents.map((calendarEvent) => {
    const calendarEventId = iCalUIDCalendarEventIdMap.get(
      calendarEvent.iCalUID,
    );

    if (!calendarEventId) {
      throw new Error(
        `Calendar event with iCalUID ${calendarEvent.iCalUID} not found in the map`,
      );
    }

    return injectIdInCalendarEvent(calendarEvent, calendarEventId);
  });
};

const injectIdInCalendarEvent = (
  calendarEvent: CalendarEventWithParticipants,
  calendarEventId: string,
): CalendarEventWithParticipantsAndCalendarEventId => {
  return {
    ...calendarEvent,
    id: calendarEventId,
    participants: calendarEvent.participants.map((participant) => ({
      ...participant,
      calendarEventId,
    })),
  };
};
