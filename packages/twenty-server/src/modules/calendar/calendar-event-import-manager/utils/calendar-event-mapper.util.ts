import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

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
