import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

export const mapCalendarEventsByICalUID = (
  existingCalendarEvents: CalendarEventWorkspaceEntity[],
): Map<string, string> => {
  return new Map<string, string>(
    existingCalendarEvents.map((calendarEvent) => [
      calendarEvent.iCalUid ?? '',
      calendarEvent.id,
    ]),
  );
};
