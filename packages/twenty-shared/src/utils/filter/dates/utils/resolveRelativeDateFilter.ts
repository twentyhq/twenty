import { addUnitToZonedDateTime } from '@/utils/filter/dates/utils/addUnitToZonedDateTime';
import { getNextPeriodStart } from '@/utils/filter/dates/utils/getNextPeriodStart';
import { getPeriodStart } from '@/utils/filter/dates/utils/getPeriodStart';
import { type RelativeDateFilter } from '@/utils/filter/dates/utils/relativeDateFilterSchema';
import { subUnitFromZonedDateTime } from '@/utils/filter/dates/utils/subUnitFromZonedDateTime';
import { isDefined } from 'class-validator';
import { type Temporal } from 'temporal-polyfill';

// TODO: use this in workflows where there is duplicated logic
export const resolveRelativeDateFilter = (
  relativeDateFilter: RelativeDateFilter,
  referenceTodayZonedDateTime: Temporal.ZonedDateTime,
) => {
  const { direction, amount, unit, firstDayOfTheWeek } = relativeDateFilter;

  switch (direction) {
    // PAST and NEXT both snap to calendar period boundaries (start of week,
    // 1st of month, 1st of quarter, Jan 1st…) before adding/subtracting the
    // amount, exactly like THIS does. This keeps every unit consistent: "Past 1
    // Week" is the previous calendar week, not a rolling 7-day window. DAY is
    // unaffected since its period boundary is the start of the day.
    case 'NEXT': {
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      const startOfNextPeriod = getNextPeriodStart(
        referenceTodayZonedDateTime,
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
        start: startOfNextPeriod.toPlainDate().toString(),
        end: endOfNextPeriod.toPlainDate().toString(),
      };
    }
    case 'PAST': {
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      const startOfCurrentPeriod = getPeriodStart(
        referenceTodayZonedDateTime,
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
        start: startOfPastPeriod.toPlainDate().toString(),
        end: startOfCurrentPeriod.toPlainDate().toString(),
      };
    }
    case 'THIS': {
      const startOfPeriod = getPeriodStart(
        referenceTodayZonedDateTime,
        unit,
        firstDayOfTheWeek,
      );

      const endOfPeriod = getNextPeriodStart(
        referenceTodayZonedDateTime,
        unit,
        firstDayOfTheWeek,
      );

      const start = startOfPeriod?.toPlainDate().toString();
      const end = endOfPeriod?.toPlainDate().toString();

      return {
        ...relativeDateFilter,
        start,
        end,
      };
    }
  }
};
