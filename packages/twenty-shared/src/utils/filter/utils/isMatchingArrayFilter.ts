import { type ArrayFilter } from '@/types';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { convertLikePatternToRegexOrThrow } from '@/utils/filter/utils/convertLikePatternToRegexOrThrow';
import { stripAccents } from '@/utils/filter/utils/stripAccents';

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
        pattern: stripAccents(arrayFilter.containsIlike),
        isCaseInsensitive: true,
      });

      return value.some((item) =>
        regexCaseInsensitive.test(stripAccents(item)),
      );
    }
    default: {
      throw new Error(
        `Unexpected value for array filter: ${JSON.stringify(arrayFilter)}`,
      );
    }
  }
};
