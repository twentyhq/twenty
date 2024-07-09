import { v4 } from 'uuid';

import {
  CalendarEventWithParticipants,
  CalendarEventWithParticipantsAndCalendarEventId,
} from 'src/modules/calendar/common/types/calendar-event';

export const injectIdsInCalendarEvents = (
  calendarEvents: CalendarEventWithParticipants[],
  iCalUIDCalendarEventIdMap: Map<string, string>,
): CalendarEventWithParticipantsAndCalendarEventId[] => {
  return calendarEvents.map((calendarEvent) => {
    const id = iCalUIDCalendarEventIdMap.get(calendarEvent.iCalUID) ?? v4();

    return injectIdInCalendarEvent(calendarEvent, id);
  });
};

const injectIdInCalendarEvent = (
  calendarEvent: CalendarEventWithParticipants,
  id: string,
): CalendarEventWithParticipantsAndCalendarEventId => {
  return {
    ...calendarEvent,
    id,
    participants: calendarEvent.participants.map((participant) => ({
      ...participant,
      calendarEventId: id,
    })),
  };
};
