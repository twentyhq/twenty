import { registerEnumType } from '@nestjs/graphql';

import { type CalendarEventRecurrenceWeekday } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence-weekday.type';

export const CalendarEventRecurrenceWeekdayEnum = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
} as const satisfies {
  [P in CalendarEventRecurrenceWeekday]: P;
};

registerEnumType(CalendarEventRecurrenceWeekdayEnum, {
  name: 'CalendarEventRecurrenceWeekday',
});
