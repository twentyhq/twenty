import { type DateFilter } from '@/types';
import { isAfter, isBefore, isEqual, parseISO } from 'date-fns';

export const isMatchingDateFilter = ({
  dateFilter,
  value,
}: {
  dateFilter: DateFilter;
  value: string | null;
}) => {
  const isValueNull = value === null;

  switch (true) {
    case dateFilter.eq !== undefined: {
      if (isValueNull) {
        return false;
      }

      return isEqual(parseISO(value), parseISO(dateFilter.eq));
    }
    case dateFilter.neq !== undefined: {
      if (isValueNull) {
        return true;
      }

      return !isEqual(parseISO(value), parseISO(dateFilter.neq));
    }
    case dateFilter.in !== undefined: {
      if (isValueNull) {
        return false;
      }

      return dateFilter.in.includes(value);
    }
    case dateFilter.is !== undefined: {
      if (dateFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case dateFilter.gt !== undefined: {
      if (isValueNull) {
        return false;
      }

      return isAfter(parseISO(value), parseISO(dateFilter.gt));
    }
    case dateFilter.gte !== undefined: {
      if (isValueNull) {
        return false;
      }

      const valueDate = parseISO(value);
      const filterDate = parseISO(dateFilter.gte);
      return isAfter(valueDate, filterDate) || isEqual(valueDate, filterDate);
    }
    case dateFilter.lt !== undefined: {
      if (isValueNull) {
        return false;
      }

      return isBefore(parseISO(value), parseISO(dateFilter.lt));
    }
    case dateFilter.lte !== undefined: {
      if (isValueNull) {
        return false;
      }

      const valueDate = parseISO(value);
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
