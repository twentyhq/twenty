import { type RelativeDateFilterUnit } from '@/utils/filter/dates/utils/relativeDateFilterUnitSchema';
import { addDays, addMonths, addWeeks, addYears } from 'date-fns';

export const addUnitToDateTime = (
  dateTime: Date,
  amount: number,
  unit: RelativeDateFilterUnit,
) => {
  switch (unit) {
    case 'DAY':
      return addDays(dateTime, amount);
    case 'WEEK':
      return addWeeks(dateTime, amount);
    case 'MONTH':
      return addMonths(dateTime, amount);
    case 'YEAR':
      return addYears(dateTime, amount);
  }
};
