import { type StringFilter } from '@/types';
import escapeRegExp from 'lodash.escaperegexp';

// postgres LIKE treats a backslash as an escape for the next char (default
// escape char), so an escaped % or _ is a literal and must not become a
// wildcard, the walk parses escape sequences before the wildcard translation
const translateLikeWildcards = (pattern: string): string => {
  let translated = '';
  let isEscaped = false;

  for (const char of pattern) {
    if (isEscaped) {
      translated += escapeRegExp(char);
      isEscaped = false;
    } else if (char === '\\') {
      isEscaped = true;
    } else if (char === '%') {
      translated += '[\\s\\S]*';
    } else if (char === '_') {
      translated += '[\\s\\S]';
    } else {
      translated += escapeRegExp(char);
    }
  }

  // postgres rejects a LIKE pattern ending with a lone escape char, the mirror
  // stays lenient and keeps it as a literal backslash
  if (isEscaped) {
    translated += escapeRegExp('\\');
  }

  return translated;
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
      // LIKE/ILIKE treat % and _ as wildcards, so the mirror has to too
      // the u flag keeps both wildcards code-point based so postgres parity
      // holds for newline and astral values (% and _ match a\nc / a😀c in postgres)
      const regexPattern = translateLikeWildcards(stringFilter.like);
      const regexCaseSensitive = new RegExp(`^${regexPattern}$`, 'u');

      return regexCaseSensitive.test(value);
    }
    case stringFilter.ilike !== undefined: {
      const regexPattern = translateLikeWildcards(stringFilter.ilike);
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
