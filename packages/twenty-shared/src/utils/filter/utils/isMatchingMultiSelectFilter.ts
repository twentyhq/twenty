import { type MultiSelectFilter } from '@/types';

export const isMatchingMultiSelectFilter = ({
  multiSelectFilter,
  value,
}: {
  multiSelectFilter: MultiSelectFilter;
  value: string[] | null;
}) => {
  switch (true) {
    case multiSelectFilter.containsAny !== undefined: {
      return (
        Array.isArray(value) &&
        multiSelectFilter.containsAny.some((item) => value.includes(item))
      );
    }
    case multiSelectFilter.containsExactly !== undefined: {
      if (!Array.isArray(value)) {
        return false;
      }

      const expectedOptions = new Set(multiSelectFilter.containsExactly);
      const actualOptions = new Set(value);

      return (
        expectedOptions.size === actualOptions.size &&
        [...expectedOptions].every((option) => actualOptions.has(option))
      );
    }
    case multiSelectFilter.isEmptyArray !== undefined: {
      return Array.isArray(value) && value.length === 0;
    }
    case multiSelectFilter.is !== undefined: {
      if (multiSelectFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected value for multi-select filter: ${JSON.stringify(
          multiSelectFilter,
        )}`,
      );
    }
  }
};
