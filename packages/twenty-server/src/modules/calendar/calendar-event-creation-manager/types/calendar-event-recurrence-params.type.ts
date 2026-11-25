import { type CalendarEventRecurrenceFrequency } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence-frequency.type';
import { type CalendarEventRecurrenceWeekday } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence-weekday.type';

export type CalendarEventRecurrenceParams = {
  frequency: CalendarEventRecurrenceFrequency;
  interval?: number | null;
  daysOfWeek?: CalendarEventRecurrenceWeekday[] | null;
  endDate?: string | null;
  endOccurrenceCount?: number | null;
};
