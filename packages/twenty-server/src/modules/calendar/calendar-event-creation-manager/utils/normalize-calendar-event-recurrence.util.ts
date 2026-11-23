import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';

import { CalendarEventRecurrenceWeekdayEnum } from 'src/modules/calendar/calendar-event-creation-manager/enums/calendar-event-recurrence-weekday.enum';
import { type CalendarEventRecurrence } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence.type';
import { type CalendarEventRecurrenceParams } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence-params.type';
import { toCalendarEventTemporalDateTime } from 'src/modules/calendar/calendar-event-creation-manager/utils/to-calendar-event-temporal-date-time.util';

const isPositiveWholeNumber = (value: number) =>
  Number.isInteger(value) && value >= 1;

export const normalizeCalendarEventRecurrence = ({
  recurrence,
  startsAt,
  isFullDay,
  timeZone,
}: {
  recurrence: CalendarEventRecurrenceParams;
  startsAt: string;
  isFullDay: boolean;
  timeZone: string;
}): CalendarEventRecurrence | { error: MessageDescriptor } => {
  const interval = recurrence.interval ?? 1;
  const endDate = recurrence.endDate ?? undefined;
  const occurrenceCount = recurrence.occurrenceCount ?? undefined;
  const firstOccurrenceDate = Temporal.PlainDate.from(
    toCalendarEventTemporalDateTime(startsAt, isFullDay, timeZone),
  ).toString();

  if (
    !isPositiveWholeNumber(interval) ||
    (isDefined(occurrenceCount) && !isPositiveWholeNumber(occurrenceCount))
  ) {
    return {
      error: msg`recurrence.interval and recurrence.occurrenceCount must be positive whole numbers`,
    };
  }

  if (isDefined(endDate) && isDefined(occurrenceCount)) {
    return {
      error: msg`A recurrence ends either on recurrence.endDate or after recurrence.occurrenceCount, not both`,
    };
  }

  if (
    isDefined(endDate) &&
    (!z.string().date().safeParse(endDate).success ||
      endDate < firstOccurrenceDate)
  ) {
    return {
      error: msg`recurrence.endDate must be a YYYY-MM-DD date on or after the event's start date (${firstOccurrenceDate})`,
    };
  }

  const isoOrderedWeekdays = Object.values(CalendarEventRecurrenceWeekdayEnum);
  const firstOccurrenceWeekday =
    isoOrderedWeekdays[
      Temporal.PlainDate.from(firstOccurrenceDate).dayOfWeek - 1
    ];
  const requestedDaysOfWeek = recurrence.daysOfWeek ?? [];
  const weeklyDaysOfWeek = isoOrderedWeekdays.filter(
    (weekday) =>
      weekday === firstOccurrenceWeekday ||
      requestedDaysOfWeek.includes(weekday),
  );
  const isWeekly = recurrence.frequency === 'WEEKLY';

  return {
    frequency: recurrence.frequency,
    interval,
    daysOfWeek: isWeekly ? weeklyDaysOfWeek : [],
    firstOccurrenceDate,
    endDate,
    occurrenceCount,
  };
};
