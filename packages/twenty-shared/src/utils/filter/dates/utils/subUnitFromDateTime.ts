import { type RelativeDateFilterUnit } from '@/utils/filter/dates/utils/relativeDateFilterUnitSchema';
import {
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subSeconds,
  subWeeks,
  subYears,
} from 'date-fns';

export const subUnitFromDateTime = (
  dateTime: Date,
  amount: number,
  unit: RelativeDateFilterUnit,
) => {
  switch (unit) {
    case 'SECOND':
      return subSeconds(dateTime, amount);
    case 'MINUTE':
      return subMinutes(dateTime, amount);
    case 'HOUR':
      return subHours(dateTime, amount);
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
