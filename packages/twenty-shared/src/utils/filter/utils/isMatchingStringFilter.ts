import { type StringFilter } from '@/types';
import escapeRegExp from 'lodash.escaperegexp';

const sqlWildcardToRegex = (pattern: string): string => {
  let result = '';

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];

    if (char === '\\' && i + 1 < pattern.length) {
      const nextChar = pattern[i + 1];

      if (nextChar === '%' || nextChar === '_' || nextChar === '\\') {
        result += escapeRegExp(nextChar);
        i++;
        continue;
      }
    }

    if (char === '%') {
      result += '[\\s\\S]*';
    } else if (char === '_') {
      result += '[\\s\\S]';
    } else {
      result += escapeRegExp(char);
    }
  }

  return result;
};

export const isMatchingStringFilter = ({
  stringFilter,
  value,
}: {
  stringFilter: StringFilter;
  value: string;
}) => {
  switch (true) {
    case stringFilter.eq !== undefined: {
      return value === stringFilter.eq;
    }
    case stringFilter.neq !== undefined: {
      return value !== stringFilter.neq;
    }
    case stringFilter.gt !== undefined: {
      return value > stringFilter.gt;
    }
    case stringFilter.gte !== undefined: {
      return value >= stringFilter.gte;
    }
    case stringFilter.lt !== undefined: {
      return value < stringFilter.lt;
    }
    case stringFilter.lte !== undefined: {
      return value <= stringFilter.lte;
    }
    case stringFilter.like !== undefined: {
      const regexPattern = sqlWildcardToRegex(stringFilter.like);
      const regexCaseSensitive = new RegExp(`^${regexPattern}$`, 'u');

      return regexCaseSensitive.test(value);
    }
    case stringFilter.ilike !== undefined: {
      const regexPattern = sqlWildcardToRegex(stringFilter.ilike);
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'iu');

      return regexCaseInsensitive.test(value);
    }
    case stringFilter.in !== undefined: {
      return stringFilter.in.includes(value);
    }
    case stringFilter.is !== undefined: {
      if (stringFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case stringFilter.regex !== undefined: {
      const regexPattern = stringFilter.regex;
      const regexCaseSensitive = new RegExp(regexPattern);

      return regexCaseSensitive.test(value);
    }
    case stringFilter.iregex !== undefined: {
      const regexPattern = stringFilter.iregex;
      const regexCaseInsensitive = new RegExp(regexPattern, 'i');

      return regexCaseInsensitive.test(value);
    }
    case stringFilter.startsWith !== undefined: {
      return value.startsWith(stringFilter.startsWith);
    }
    default: {
      throw new Error(
        `Unexpected value for string filter : ${JSON.stringify(stringFilter)}`,
      );
    }
  }
};
