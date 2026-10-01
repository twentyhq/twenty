import { type DateFilter } from '@/types';
import { isDefined } from '@/utils';
import { isNonEmptyString } from '@sniptt/guards';
import { isAfter, isBefore, isEqual, isValid, parseISO } from 'date-fns';

const safeParseDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  if (isNonEmptyString(value) && value.trim().length > 0) {
    try {
      const parsedDate = parseISO(value);

      return isValid(parsedDate) ? parsedDate : null;
    } catch {
      return null;
    }
  }

  return null;
};

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

  if (dateFilter.is === 'NULL') {
    return false;
  }

  const hasComparison =
    dateFilter.eq !== undefined ||
    dateFilter.neq !== undefined ||
    dateFilter.in !== undefined ||
    dateFilter.gt !== undefined ||
    dateFilter.gte !== undefined ||
    dateFilter.lt !== undefined ||
    dateFilter.lte !== undefined;

  if (!hasComparison && dateFilter.is !== undefined) {
    return dateFilter.is === 'NOT_NULL' ? value !== null : value === null;
  }

  const valueDate = safeParseDate(value);

  if (!valueDate) {
    return false;
  }

  switch (true) {
    case dateFilter.eq !== undefined: {
      const filterDate = safeParseDate(dateFilter.eq);

      return filterDate ? isEqual(valueDate, filterDate) : false;
    }
    case dateFilter.neq !== undefined: {
      const filterDate = safeParseDate(dateFilter.neq);

      return filterDate ? !isEqual(valueDate, filterDate) : false;
    }
    case dateFilter.in !== undefined: {
      if (!Array.isArray(dateFilter.in)) {
        return false;
      }

      return dateFilter.in.some((filterValue) => {
        const filterDate = safeParseDate(filterValue);

        return filterDate ? isEqual(valueDate, filterDate) : false;
      });
    }
    case dateFilter.gt !== undefined: {
      const filterDate = safeParseDate(dateFilter.gt);

      return filterDate ? isAfter(valueDate, filterDate) : false;
    }
    case dateFilter.gte !== undefined: {
      const filterDate = safeParseDate(dateFilter.gte);

      return filterDate
        ? isAfter(valueDate, filterDate) || isEqual(valueDate, filterDate)
        : false;
    }
    case dateFilter.lt !== undefined: {
      const filterDate = safeParseDate(dateFilter.lt);

      return filterDate ? isBefore(valueDate, filterDate) : false;
    }
    case dateFilter.lte !== undefined: {
      const filterDate = safeParseDate(dateFilter.lte);

      return filterDate
        ? isBefore(valueDate, filterDate) || isEqual(valueDate, filterDate)
        : false;
    }
    case dateFilter.is !== undefined: {
      return dateFilter.is === 'NOT_NULL' ? value !== null : value === null;
    }
    default: {
      throw new Error(
        `Unexpected value for date filter : ${JSON.stringify(dateFilter)}`,
      );
    }
  }
};
