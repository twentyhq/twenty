import { addUnitToZonedDateTime } from '@/utils/filter/dates/utils/addUnitToZonedDateTime';
import { getNextPeriodStart } from '@/utils/filter/dates/utils/getNextPeriodStart';
import { getPeriodStart } from '@/utils/filter/dates/utils/getPeriodStart';
import { type RelativeDateFilter } from '@/utils/filter/dates/utils/relativeDateFilterSchema';
import { subUnitFromZonedDateTime } from '@/utils/filter/dates/utils/subUnitFromZonedDateTime';
import { isDefined } from '@/utils/validation/isDefined';
import { type Temporal } from 'temporal-polyfill';

export const resolveRelativeDateFilter = (
  relativeDateFilter: RelativeDateFilter,
  referenceTodayZonedDateTime: Temporal.ZonedDateTime,
) => {
  const { direction, amount, unit, firstDayOfTheWeek, calendarSystem } =
    relativeDateFilter;

  const referenceTodayInCalendar = referenceTodayZonedDateTime.withCalendar(
    calendarSystem ?? 'iso8601',
  );

  const toPlainDateISOString = (zonedDateTime: Temporal.ZonedDateTime) =>
    zonedDateTime.toPlainDate().withCalendar('iso8601').toString();

  switch (direction) {
    case 'NEXT': {
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      const startOfNextPeriod = getNextPeriodStart(
        referenceTodayInCalendar,
        unit,
        firstDayOfTheWeek,
      );

      const endOfNextPeriod = addUnitToZonedDateTime(
        startOfNextPeriod,
        unit,
        amount,
      );

      return {
        ...relativeDateFilter,
        start: toPlainDateISOString(startOfNextPeriod),
        end: toPlainDateISOString(endOfNextPeriod),
      };
    }
    case 'PAST': {
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      const startOfCurrentPeriod = getPeriodStart(
        referenceTodayInCalendar,
        unit,
        firstDayOfTheWeek,
      );

      const startOfPastPeriod = subUnitFromZonedDateTime(
        startOfCurrentPeriod,
        unit,
        amount,
      );

      return {
        ...relativeDateFilter,
        start: toPlainDateISOString(startOfPastPeriod),
        end: toPlainDateISOString(startOfCurrentPeriod),
      };
    }
    case 'THIS': {
      const startOfPeriod = getPeriodStart(
        referenceTodayInCalendar,
        unit,
        firstDayOfTheWeek,
      );

      const endOfPeriod = getNextPeriodStart(
        referenceTodayInCalendar,
        unit,
        firstDayOfTheWeek,
      );

      const start = toPlainDateISOString(startOfPeriod);
      const end = toPlainDateISOString(endOfPeriod);

      return {
        ...relativeDateFilter,
        start,
        end,
      };
    }
  }
};
