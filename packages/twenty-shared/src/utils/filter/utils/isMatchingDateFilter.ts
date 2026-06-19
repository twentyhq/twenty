import { type DateFilter } from '@/types';
import { isAfter, isBefore, isEqual, parseISO } from 'date-fns';

// In the RLS event-matching path, date values arrive as Date objects rather
// than ISO strings. parseISO only accepts strings (it calls value.split), so
// normalize before parsing to avoid `split is not a function`.
const parseDateValue = (value: string | Date): Date =>
  value instanceof Date ? value : parseISO(value);

export const isMatchingDateFilter = ({
  dateFilter,
  value,
}: {
  dateFilter: DateFilter;
  value: string | Date;
}) => {
  switch (true) {
    case dateFilter.eq !== undefined: {
      return isEqual(parseDateValue(value), parseISO(dateFilter.eq));
    }
    case dateFilter.neq !== undefined: {
      return !isEqual(parseDateValue(value), parseISO(dateFilter.neq));
    }
    case dateFilter.in !== undefined: {
      return typeof value === 'string' && dateFilter.in.includes(value);
    }
    case dateFilter.is !== undefined: {
      if (dateFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case dateFilter.gt !== undefined: {
      return isAfter(parseDateValue(value), parseISO(dateFilter.gt));
    }
    case dateFilter.gte !== undefined: {
      const valueDate = parseDateValue(value);
      const filterDate = parseISO(dateFilter.gte);
      return isAfter(valueDate, filterDate) || isEqual(valueDate, filterDate);
    }
    case dateFilter.lt !== undefined: {
      return isBefore(parseDateValue(value), parseISO(dateFilter.lt));
    }
    case dateFilter.lte !== undefined: {
      const valueDate = parseDateValue(value);
      const filterDate = parseISO(dateFilter.lte);
      return isBefore(valueDate, filterDate) || isEqual(valueDate, filterDate);
    }
    default: {
      throw new Error(
        `Unexpected value for string filter : ${JSON.stringify(dateFilter)}`,
      );
    }
  }
};
