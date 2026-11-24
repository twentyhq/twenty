import { isDefined } from 'twenty-shared/utils';
import { Temporal } from 'temporal-polyfill';

import { type CalendarEventRecurrence } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence.type';

const toICalUntil = ({
  endDate,
  isFullDay,
  timeZone,
}: {
  endDate: string;
  isFullDay: boolean;
  timeZone: string;
}) => {
  const lastMomentOfEndDate = isFullDay
    ? endDate
    : Temporal.PlainDate.from(endDate)
        .add({ days: 1 })
        .toZonedDateTime(timeZone)
        .toInstant()
        .subtract({ seconds: 1 })
        .toString({ smallestUnit: 'second' });

  return lastMomentOfEndDate.replace(/[-:]/g, '');
};

export const toICalRecurrenceRule = ({
  recurrence,
  isFullDay,
  timeZone,
}: {
  recurrence: CalendarEventRecurrence;
  isFullDay: boolean;
  timeZone: string;
}): string => {
  const ruleParts = [
    `FREQ=${recurrence.frequency}`,
    `INTERVAL=${recurrence.interval}`,
  ];

  if (recurrence.daysOfWeek.length > 0) {
    ruleParts.push(
      `BYDAY=${recurrence.daysOfWeek.map((weekday) => weekday.slice(0, 2)).join(',')}`,
    );
  }

  if (isDefined(recurrence.endOccurrenceCount)) {
    ruleParts.push(`COUNT=${recurrence.endOccurrenceCount}`);
  }

  if (isDefined(recurrence.endDate)) {
    ruleParts.push(
      `UNTIL=${toICalUntil({ endDate: recurrence.endDate, isFullDay, timeZone })}`,
    );
  }

  return `RRULE:${ruleParts.join(';')}`;
};
