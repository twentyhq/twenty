import { type MultiSelectFilter } from '@/types';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';

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
    case multiSelectFilter.isEmptyArray !== undefined: {
      return multiSelectFilter.isEmptyArray !== isNonEmptyArray(value);
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
