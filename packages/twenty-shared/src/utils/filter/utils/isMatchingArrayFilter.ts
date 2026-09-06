import escapeRegExp from 'lodash.escaperegexp';

import { type ArrayFilter } from '@/types';

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
      const hasWildcards =
        arrayFilter.containsIlike.includes('%') ||
        arrayFilter.containsIlike.includes('_');

      if (hasWildcards) {
        const escapedPattern = escapeRegExp(arrayFilter.containsIlike)
          .replace(/%/g, '.*')
          .replace(/_/g, '.');
        const regexCaseInsensitive = new RegExp(`^${escapedPattern}$`, 'i');

        return (
          Array.isArray(value) &&
          value.some(
            (item) =>
              typeof item === 'string' && regexCaseInsensitive.test(item),
          )
        );
      }

      const searchTerm = arrayFilter.containsIlike.toLowerCase();

      return (
        Array.isArray(value) &&
        value.some(
          (item) =>
            typeof item === 'string' && item.toLowerCase().includes(searchTerm),
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
