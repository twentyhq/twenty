import { type ArrayFilter } from '@/types';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { convertLikePatternToRegexOrThrow } from '@/utils/filter/utils/convertLikePatternToRegexOrThrow';

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
      if (!isNonEmptyArray(value)) {
        return false;
      }

      const regexCaseInsensitive = convertLikePatternToRegexOrThrow({
        pattern: arrayFilter.containsIlike,
        isCaseInsensitive: true,
      });

      return value.some((item) => regexCaseInsensitive.test(item));
    }
    default: {
      throw new Error(
        `Unexpected value for array filter: ${JSON.stringify(arrayFilter)}`,
      );
    }
  }
};
