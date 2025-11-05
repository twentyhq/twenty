import { type RelativeDateFilterUnit } from '@/utils/filter/dates/utils/relativeDateFilterUnitSchema';
import { subDays, subMonths, subWeeks, subYears } from 'date-fns';

export const subUnitFromDateTime = (
  dateTime: Date,
  amount: number,
  unit: RelativeDateFilterUnit,
) => {
  switch (unit) {
    case 'DAY':
      return subDays(dateTime, amount);
    case 'WEEK':
      return subWeeks(dateTime, amount);
    case 'MONTH':
      return subMonths(dateTime, amount);
    case 'YEAR':
      return subYears(dateTime, amount);
  }
};
