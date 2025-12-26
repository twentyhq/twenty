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
    case 'NEXT': {
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      const startOfNextDay = referenceTodayZonedDateTime
        .startOfDay()
        .add({ days: 1 });

      const startOfNextPeriod = addUnitToZonedDateTime(
        startOfNextDay,
        unit,
        amount,
      );

      const start = startOfNextDay.toPlainDate().toString();
      const end = startOfNextPeriod?.toPlainDate().toString();

      return {
        ...relativeDateFilter,
        start,
        end,
      };
    }
    case 'PAST': {
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      const startOfDay = referenceTodayZonedDateTime.startOfDay();

      const startOfNextPeriod = subUnitFromZonedDateTime(
        startOfDay,
        unit,
        amount,
      );

      const start = startOfNextPeriod?.toPlainDate().toString();
      const end = startOfDay.toPlainDate().toString();

      return {
        ...relativeDateFilter,
        start,
        end,
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
