import {
  type PatternedRecurrence,
  type RecurrenceRange,
} from '@microsoft/microsoft-graph-types';
import { isDefined } from 'twenty-shared/utils';
import { Temporal } from 'temporal-polyfill';

import { toMicrosoftDayOfWeek } from 'src/modules/calendar/calendar-event-creation-manager/drivers/utils/to-microsoft-day-of-week.util';
import { type CalendarEventRecurrence } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence.type';

export const toMicrosoftEventRecurrence = ({
  recurrence,
  timeZone,
}: {
  recurrence: CalendarEventRecurrence;
  timeZone: string;
}): PatternedRecurrence => {
  const { day, month } = Temporal.PlainDate.from(
    recurrence.firstOccurrenceDate,
  );
  const { interval } = recurrence;

  const range: RecurrenceRange = {
    type: 'noEnd',
    startDate: recurrence.firstOccurrenceDate,
    recurrenceTimeZone: timeZone,
  };

  if (isDefined(recurrence.endDate)) {
    range.type = 'endDate';
    range.endDate = recurrence.endDate;
  }

  if (isDefined(recurrence.endOccurrenceCount)) {
    range.type = 'numbered';
    range.numberOfOccurrences = recurrence.endOccurrenceCount;
  }

  switch (recurrence.frequency) {
    case 'DAILY':
      return { pattern: { type: 'daily', interval }, range };
    case 'WEEKLY':
      return {
        pattern: {
          type: 'weekly',
          interval,
          daysOfWeek: recurrence.daysOfWeek.map(toMicrosoftDayOfWeek),
          firstDayOfWeek: 'monday',
        },
        range,
      };
    case 'MONTHLY':
      return {
        pattern: { type: 'absoluteMonthly', interval, dayOfMonth: day },
        range,
      };
    case 'YEARLY':
      return {
        pattern: { type: 'absoluteYearly', interval, dayOfMonth: day, month },
        range,
      };
  }
};
