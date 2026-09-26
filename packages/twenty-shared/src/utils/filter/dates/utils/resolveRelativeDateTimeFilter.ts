import { addUnitToZonedDateTime } from '@/utils/filter/dates/utils/addUnitToZonedDateTime';
import { getNextPeriodStart } from '@/utils/filter/dates/utils/getNextPeriodStart';
import { getPeriodStart } from '@/utils/filter/dates/utils/getPeriodStart';
import { type RelativeDateFilter } from '@/utils/filter/dates/utils/relativeDateFilterSchema';
import { subUnitFromZonedDateTime } from '@/utils/filter/dates/utils/subUnitFromZonedDateTime';
import { isDefined } from '@/utils/validation';
import { type Temporal } from 'temporal-polyfill';

export const resolveRelativeDateTimeFilter = (
  relativeDateFilter: RelativeDateFilter,
  referenceZonedDateTime: Temporal.ZonedDateTime,
) => {
  const { direction, amount, unit, firstDayOfTheWeek, calendarSystem } =
    relativeDateFilter;

  const referenceInCalendar = referenceZonedDateTime.withCalendar(
    calendarSystem ?? 'iso8601',
  );

  switch (direction) {
    case 'NEXT': {
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      const startOfNextPeriod = getNextPeriodStart(
        referenceInCalendar,
        unit,
        firstDayOfTheWeek,
      );

      return {
        ...relativeDateFilter,
        start: startOfNextPeriod.withCalendar('iso8601'),
        end: addUnitToZonedDateTime(
          startOfNextPeriod,
          unit,
          amount,
        ).withCalendar('iso8601'),
      };
    }
    case 'PAST': {
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      const startOfCurrentPeriod = getPeriodStart(
        referenceInCalendar,
        unit,
        firstDayOfTheWeek,
      );

      return {
        ...relativeDateFilter,
        start: subUnitFromZonedDateTime(
          startOfCurrentPeriod,
          unit,
          amount,
        ).withCalendar('iso8601'),
        end: startOfCurrentPeriod.withCalendar('iso8601'),
      };
    }
    case 'THIS':
      return {
        ...relativeDateFilter,
        start: getPeriodStart(
          referenceInCalendar,
          unit,
          firstDayOfTheWeek,
        ).withCalendar('iso8601'),
        end: getNextPeriodStart(
          referenceInCalendar,
          unit,
          firstDayOfTheWeek,
        ).withCalendar('iso8601'),
      };
  }
};
