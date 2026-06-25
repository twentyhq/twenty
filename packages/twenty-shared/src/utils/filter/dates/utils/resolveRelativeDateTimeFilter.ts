import { addUnitToZonedDateTime } from '@/utils/filter/dates/utils/addUnitToZonedDateTime';
import { getNextPeriodStart } from '@/utils/filter/dates/utils/getNextPeriodStart';
import { getPeriodStart } from '@/utils/filter/dates/utils/getPeriodStart';
import { isSubDayRelativeDateFilterUnit } from '@/utils/filter/dates/utils/isSubDayRelativeDateFilterUnit';
import { type RelativeDateFilter } from '@/utils/filter/dates/utils/relativeDateFilterSchema';
import { subUnitFromZonedDateTime } from '@/utils/filter/dates/utils/subUnitFromZonedDateTime';
import { isDefined } from '@/utils/validation';
import { type Temporal } from 'temporal-polyfill';

export const resolveRelativeDateTimeFilter = (
  relativeDateFilter: RelativeDateFilter,
  referenceZonedDateTime: Temporal.ZonedDateTime,
) => {
  const { direction, amount, unit, firstDayOfTheWeek } = relativeDateFilter;

  const isSubDayUnit = isSubDayRelativeDateFilterUnit(unit);

  switch (direction) {
    // Sub-day units (SECOND/MINUTE/HOUR) keep a rolling window from "now" since
    // they have no meaningful calendar boundary here. Every other unit snaps to
    // its calendar period boundary (start of week, 1st of month/quarter, Jan
    // 1st…) before adding/subtracting the amount, exactly like THIS does — so
    // "Past 1 Week" is the previous calendar week, not a rolling 7-day window.
    case 'NEXT': {
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      if (isSubDayUnit) {
        return {
          ...relativeDateFilter,
          start: referenceZonedDateTime,
          end: addUnitToZonedDateTime(referenceZonedDateTime, unit, amount),
        };
      }

      const startOfNextPeriod = getNextPeriodStart(
        referenceZonedDateTime,
        unit,
        firstDayOfTheWeek,
      );

      return {
        ...relativeDateFilter,
        start: startOfNextPeriod,
        end: addUnitToZonedDateTime(startOfNextPeriod, unit, amount),
      };
    }
    case 'PAST': {
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      if (isSubDayUnit) {
        return {
          ...relativeDateFilter,
          start: subUnitFromZonedDateTime(referenceZonedDateTime, unit, amount),
          end: referenceZonedDateTime,
        };
      }

      const startOfCurrentPeriod = getPeriodStart(
        referenceZonedDateTime,
        unit,
        firstDayOfTheWeek,
      );

      return {
        ...relativeDateFilter,
        start: subUnitFromZonedDateTime(startOfCurrentPeriod, unit, amount),
        end: startOfCurrentPeriod,
      };
    }
    case 'THIS':
      return {
        ...relativeDateFilter,
        start: getPeriodStart(referenceZonedDateTime, unit, firstDayOfTheWeek),
        end: getNextPeriodStart(
          referenceZonedDateTime,
          unit,
          firstDayOfTheWeek,
        ),
      };
  }
};
