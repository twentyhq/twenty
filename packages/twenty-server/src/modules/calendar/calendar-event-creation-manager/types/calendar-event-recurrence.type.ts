import { type CalendarEventRecurrenceFrequency } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence-frequency.type';
import { type CalendarEventRecurrenceWeekday } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence-weekday.type';

export type CalendarEventRecurrence = {
  frequency: CalendarEventRecurrenceFrequency;
  interval: number;
  daysOfWeek: CalendarEventRecurrenceWeekday[];
  firstOccurrenceDate: string;
  endDate?: string;
  endOccurrenceCount?: number;
};
