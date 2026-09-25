import { type RawJsonFilter } from '@/types';
import { isDefined } from '@/utils';
import { convertJsonValueToPostgresJsonbText } from '@/utils/filter/utils/convertJsonValueToPostgresJsonbText';
import { convertLikePatternToRegexOrThrow } from '@/utils/filter/utils/convertLikePatternToRegexOrThrow';

const isMatchingLikePattern = ({
  pattern,
  value,
  isCaseInsensitive,
}: {
  pattern: string;
  value: unknown;
  isCaseInsensitive: boolean;
}) => {
  if (!isDefined(value)) {
    return false;
  }

  return convertLikePatternToRegexOrThrow({
    pattern,
    isCaseInsensitive,
  }).test(convertJsonValueToPostgresJsonbText(value));
};

export const isMatchingRawJsonFilter = ({
  rawJsonFilter,
  value,
}: {
  rawJsonFilter: RawJsonFilter;
  value: unknown;
}) => {
  switch (true) {
    case rawJsonFilter.like !== undefined: {
      return isMatchingLikePattern({
        pattern: rawJsonFilter.like,
        value,
        isCaseInsensitive: false,
      });
    }
    case rawJsonFilter.ilike !== undefined: {
      return isMatchingLikePattern({
        pattern: rawJsonFilter.ilike,
        value,
        isCaseInsensitive: true,
      });
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
