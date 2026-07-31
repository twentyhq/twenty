import { type SelectFilter } from '@/types';

// Cursor-based pagination derives its operator from the sort direction alone,
// without looking at the field type, so a view sorted on a SELECT field emits
// filters such as { stage: { lt: 'NEW' } }. These operators are absent from
// SelectFilter, yet they reach this predicate at runtime.
const COMPARISON_OPERATORS = ['gt', 'gte', 'lt', 'lte'] as const;

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
    default: {
      // SELECT columns are PostgreSQL enums, so the server compares them on
      // option position — an order this predicate cannot know, since it only
      // receives the value. Throwing here would abort the caller's mutation
      // (the optimistic cache update runs inside it), so keep the record and
      // let the server, which is authoritative, settle it.
      if (COMPARISON_OPERATORS.some((operator) => operator in selectFilter)) {
        return true;
      }

      throw new Error(
        `Unexpected value for select filter : ${JSON.stringify(selectFilter)}`,
      );
    }
  }
};
