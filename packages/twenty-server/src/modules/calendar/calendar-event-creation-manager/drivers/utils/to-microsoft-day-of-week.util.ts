import { type DayOfWeek } from '@microsoft/microsoft-graph-types';

import { type CalendarEventRecurrenceWeekday } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence-weekday.type';

export const toMicrosoftDayOfWeek = (
  weekday: CalendarEventRecurrenceWeekday,
): DayOfWeek => {
  switch (weekday) {
    case 'MONDAY':
      return 'monday';
    case 'TUESDAY':
      return 'tuesday';
    case 'WEDNESDAY':
      return 'wednesday';
    case 'THURSDAY':
      return 'thursday';
    case 'FRIDAY':
      return 'friday';
    case 'SATURDAY':
      return 'saturday';
    case 'SUNDAY':
      return 'sunday';
  }
};
