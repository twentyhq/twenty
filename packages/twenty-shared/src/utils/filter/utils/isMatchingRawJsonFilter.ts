import { type RawJsonFilter } from '@/types';
import { convertLikePatternToRegexOrThrow } from '@/utils/filter/utils/convertLikePatternToRegexOrThrow';

export const isMatchingRawJsonFilter = ({
  rawJsonFilter,
  value,
}: {
  rawJsonFilter: RawJsonFilter;
  value: string;
}) => {
  switch (true) {
    case rawJsonFilter.like !== undefined: {
      const regexCaseInsensitive = convertLikePatternToRegexOrThrow({
        pattern: rawJsonFilter.like,
        isCaseInsensitive: true,
      });

      const stringValue = JSON.stringify(value, null, 1);

      return regexCaseInsensitive.test(stringValue);
    }
    case rawJsonFilter.is !== undefined: {
      if (rawJsonFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected value for string filter : ${JSON.stringify(rawJsonFilter)}`,
      );
    }
  }
};
