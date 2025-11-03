import { addUnitToDateTime } from '@/utils/filter/dates/utils/addUnitToDateTime';
import { getEndUnitOfDateTime } from '@/utils/filter/dates/utils/getEndUnitOfDateTime';
import { getStartUnitOfDateTime } from '@/utils/filter/dates/utils/getStartUnitOfDateTime';
import { type RelativeDateFilter } from '@/utils/filter/dates/utils/relativeDateFilterSchema';
import { subUnitFromDateTime } from '@/utils/filter/dates/utils/subUnitFromDateTime';
import { isDefined } from '@/utils/validation';
import { TZDate } from '@date-fns/tz';
import { isNonEmptyString } from '@sniptt/guards';
import { roundToNearestMinutes } from 'date-fns';

export const resolveRelativeDateTimeFilter = (
  relativeDateFilter: RelativeDateFilter,
) => {
  const { direction, amount, unit, timezone, firstDayOfTheWeek } =
    relativeDateFilter;

  const referenceDate = roundToNearestMinutes(
    isNonEmptyString(timezone)
      ? new TZDate().withTimeZone(timezone)
      : new TZDate(),
  );

  switch (direction) {
    case 'NEXT':
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      return {
        ...relativeDateFilter,
        start: referenceDate,
        end: addUnitToDateTime(referenceDate, amount, unit),
      };
    case 'PAST':
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      return {
        ...relativeDateFilter,
        start: subUnitFromDateTime(referenceDate, amount, unit),
        end: referenceDate,
      };
    case 'THIS':
      return {
        ...relativeDateFilter,
        start: getStartUnitOfDateTime(referenceDate, unit, firstDayOfTheWeek),
        end: getEndUnitOfDateTime(referenceDate, unit, firstDayOfTheWeek),
      };
  }
};
