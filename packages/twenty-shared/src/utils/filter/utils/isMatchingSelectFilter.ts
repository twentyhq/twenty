import { type SelectFilter } from '@/types';

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
    // Cursor-based pagination builds gt/lt conditions from the view's sort,
    // so a view sorted by a Select field produces them on this filter.
    // Compared lexicographically, like isMatchingUUIDFilter and
    // isMatchingStringFilter — the server orders by option position, so an
    // optimistic result can be misplaced until the next fetch corrects it.
    // Throwing here instead would abort the mutation and lose the write.
    case selectFilter.gt !== undefined: {
      return value > selectFilter.gt;
    }
    case selectFilter.gte !== undefined: {
      return value >= selectFilter.gte;
    }
    case selectFilter.lt !== undefined: {
      return value < selectFilter.lt;
    }
    case selectFilter.lte !== undefined: {
      return value <= selectFilter.lte;
    }
    default: {
      throw new Error(
        `Unexpected value for select filter : ${JSON.stringify(selectFilter)}`,
      );
    }
  }
};
