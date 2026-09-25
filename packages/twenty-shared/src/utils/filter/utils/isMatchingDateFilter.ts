import { type DateFilter } from '@/types';
import { isDefined } from '@/utils';
import { isAfter, isBefore, isEqual, parseISO } from 'date-fns';

export const isMatchingDateFilter = ({
  dateFilter,
  value,
}: {
  dateFilter: DateFilter;
  value: Date | string | null | undefined;
}) => {
  if (!isDefined(value)) {
    return dateFilter.is === 'NULL';
  }

  const valueDate = value instanceof Date ? value : parseISO(value);

  switch (true) {
    case dateFilter.eq !== undefined: {
      return isEqual(valueDate, parseISO(dateFilter.eq));
    }
    case dateFilter.neq !== undefined: {
      return !isEqual(valueDate, parseISO(dateFilter.neq));
    }
    case dateFilter.in !== undefined: {
      return dateFilter.in.some((filterValue) =>
        isEqual(valueDate, parseISO(filterValue)),
      );
    }
    case dateFilter.is !== undefined: {
      if (dateFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case dateFilter.gt !== undefined: {
      return isAfter(valueDate, parseISO(dateFilter.gt));
    }
    case dateFilter.gte !== undefined: {
      const filterDate = parseISO(dateFilter.gte);

      return isAfter(valueDate, filterDate) || isEqual(valueDate, filterDate);
    }
    case dateFilter.lt !== undefined: {
      return isBefore(valueDate, parseISO(dateFilter.lt));
    }
    case dateFilter.lte !== undefined: {
      const filterDate = parseISO(dateFilter.lte);

      return isBefore(valueDate, filterDate) || isEqual(valueDate, filterDate);
    }
    default: {
      throw new Error(
        `Unexpected value for date filter : ${JSON.stringify(dateFilter)}`,
      );
    }
  }
};
