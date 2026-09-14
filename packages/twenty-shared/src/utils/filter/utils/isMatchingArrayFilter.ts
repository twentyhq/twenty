import { type ArrayFilter } from '@/types';

import { isMatchingStringFilter } from './isMatchingStringFilter';

export const isMatchingArrayFilter = ({
  arrayFilter,
  value,
}: {
  arrayFilter: ArrayFilter;
  value: string[] | null;
}) => {
  switch (true) {
    case arrayFilter.is !== undefined: {
      if (arrayFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case arrayFilter.isEmptyArray !== undefined: {
      return Array.isArray(value) && value.length === 0;
    }
    case arrayFilter.containsIlike !== undefined: {
      const ilikePattern = arrayFilter.containsIlike;

      // Postgres unnest(array) ILIKE :pattern treats % as a wildcard
      return (
        Array.isArray(value) &&
        value.some((item) =>
          isMatchingStringFilter({
            stringFilter: { ilike: ilikePattern },
            value: item,
          }),
        )
      );
    }
    default: {
      throw new Error(
        `Unexpected value for array filter: ${JSON.stringify(arrayFilter)}`,
      );
    }
  }
};
