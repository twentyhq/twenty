import { registerEnumType } from '@nestjs/graphql';

import { type CalendarEventRecurrenceFrequency } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence-frequency.type';

export const CalendarEventRecurrenceFrequencyEnum = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const satisfies {
  [P in CalendarEventRecurrenceFrequency]: P;
};

registerEnumType(CalendarEventRecurrenceFrequencyEnum, {
  name: 'CalendarEventRecurrenceFrequency',
});
