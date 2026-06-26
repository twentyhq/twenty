import { type ComposedCalendarEvent } from 'src/modules/calendar/calendar-event-creation-manager/types/composed-calendar-event.type';

export type CalendarEventComposerResult =
  | { success: true; data: ComposedCalendarEvent }
  | { success: false; error: string };
