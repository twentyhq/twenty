import { addUnitToDateTime } from '@/utils/filter/dates/utils/addUnitToDateTime';
import { getEndUnitOfDateTime } from '@/utils/filter/dates/utils/getEndUnitOfDateTime';
import { getPlainDateFromDate } from '@/utils/filter/dates/utils/getPlainDateFromDate';
import { getStartUnitOfDateTime } from '@/utils/filter/dates/utils/getStartUnitOfDateTime';
import { type RelativeDateFilter } from '@/utils/filter/dates/utils/relativeDateFilterSchema';
import { subUnitFromDateTime } from '@/utils/filter/dates/utils/subUnitFromDateTime';
import { isDefined } from '@/utils/validation';
import { TZDate } from '@date-fns/tz';

export const resolveRelativeDateFilter = (
  relativeDateFilter: RelativeDateFilter,
) => {
  const { direction, amount, unit, firstDayOfTheWeek } = relativeDateFilter;

  const referenceDate = new TZDate();

  switch (direction) {
    case 'NEXT':
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      return {
        ...relativeDateFilter,
        start: getPlainDateFromDate(referenceDate),
        end: getPlainDateFromDate(
          addUnitToDateTime(referenceDate, amount, unit),
        ),
      };
    case 'PAST':
      if (!isDefined(amount)) {
        throw new Error('Amount is required');
      }

      return {
        ...relativeDateFilter,
        start: getPlainDateFromDate(
          subUnitFromDateTime(referenceDate, amount, unit),
        ),
        end: getPlainDateFromDate(referenceDate),
      };
    case 'THIS':
      return {
        ...relativeDateFilter,
        start: getPlainDateFromDate(
          getStartUnitOfDateTime(referenceDate, unit, firstDayOfTheWeek),
        ),
        end: getPlainDateFromDate(
          getEndUnitOfDateTime(referenceDate, unit, firstDayOfTheWeek),
        ),
      };
  }
};
