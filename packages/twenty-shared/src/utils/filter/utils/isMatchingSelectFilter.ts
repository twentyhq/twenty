import { type SelectFilter } from '@/types';
import { isDefined } from '@/utils';

export const isMatchingSelectFilter = ({
  selectFilter,
  value,
}: {
  selectFilter: SelectFilter;
  value: string;
}) => {
  switch (true) {
    case selectFilter.in !== undefined: {
      return selectFilter.in.includes(value);
    }
    case selectFilter.is !== undefined: {
      if (selectFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case selectFilter.eq !== undefined: {
      return value === selectFilter.eq;
    }
    case selectFilter.neq !== undefined: {
      return value !== selectFilter.neq;
    }
    // Cursor-based pagination builds gt/lt conditions from the view's sort, so
    // a view sorted by a Select field produces them on this filter. The server
    // orders Select as LOWER(value::text), so compare case-insensitively to
    // keep the optimistic cache consistent with its ordering. A null value
    // satisfies no comparison, matching NULL semantics in Postgres.
    case selectFilter.gt !== undefined: {
      return (
        isDefined(value) && value.toLowerCase() > selectFilter.gt.toLowerCase()
      );
    }
    case selectFilter.gte !== undefined: {
      return (
        isDefined(value) &&
        value.toLowerCase() >= selectFilter.gte.toLowerCase()
      );
    }
    case selectFilter.lt !== undefined: {
      return (
        isDefined(value) && value.toLowerCase() < selectFilter.lt.toLowerCase()
      );
    }
    case selectFilter.lte !== undefined: {
      return (
        isDefined(value) &&
        value.toLowerCase() <= selectFilter.lte.toLowerCase()
      );
    }
    default: {
      throw new Error(
        `Unexpected value for select filter : ${JSON.stringify(selectFilter)}`,
      );
    }
  }
};
