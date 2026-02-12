import { type RelativeDateFilterUnit } from '@/utils/filter/dates/utils/relativeDateFilterUnitSchema';
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  addYears,
} from 'date-fns';

/** @deprecated Use addUnitToZonedDateTime */
export const addUnitToDateTime = (
  dateTime: Date,
  amount: number,
  unit: RelativeDateFilterUnit,
) => {
  switch (unit) {
    case 'SECOND':
      return addSeconds(dateTime, amount);
    case 'MINUTE':
      return addMinutes(dateTime, amount);
    case 'HOUR':
      return addHours(dateTime, amount);
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
