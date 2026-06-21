import { type DateFilter } from '@/types';
import { isDefined } from '@/utils';
import { isAfter, isBefore, isEqual, parseISO } from 'date-fns';

const normalizeToDate = (value: Date | string): Date =>
  value instanceof Date ? value : parseISO(value);

export const isMatchingDateFilter = ({
  dateFilter,
  value,
}: {
  dateFilter: DateFilter;
  value: Date | string | null | undefined;
}) => {
  if (dateFilter.is !== undefined) {
    return dateFilter.is === 'NULL' ? !isDefined(value) : isDefined(value);
  }

  if (!isDefined(value)) {
    return false;
  }

  const valueDate = normalizeToDate(value);

  switch (true) {
    case dateFilter.eq !== undefined: {
      return isEqual(valueDate, parseISO(dateFilter.eq));
    }
    case dateFilter.neq !== undefined: {
      return !isEqual(valueDate, parseISO(dateFilter.neq));
    }
    case dateFilter.in !== undefined: {
      return dateFilter.in.some((dateString) =>
        isEqual(valueDate, parseISO(dateString)),
      );
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
        `Unexpected value for string filter : ${JSON.stringify(dateFilter)}`,
      );
    }
  }
};
