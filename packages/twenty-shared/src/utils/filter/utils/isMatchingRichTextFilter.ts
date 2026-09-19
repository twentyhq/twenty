import { type RichTextFilter } from '@/types';
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

export const isMatchingRichTextFilter = ({
  richTextFilter,
  value,
}: {
  richTextFilter: RichTextFilter;
  value: string | { markdown?: string; blocknote?: string } | null;
}) => {
  switch (true) {
    case richTextFilter.markdown !== undefined: {
      const targetValue =
        typeof value === 'object' && value !== null
          ? (value.markdown ?? '')
          : value;

      if (typeof targetValue !== 'string') {
        return false;
      }

      const regexPattern = sqlWildcardToRegex(
        richTextFilter.markdown.ilike ?? '',
      );
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'iu');

      return regexCaseInsensitive.test(targetValue);
    }
    case richTextFilter.blocknote !== undefined: {
      const targetValue =
        typeof value === 'object' && value !== null
          ? (value.blocknote ?? '')
          : value;

      if (typeof targetValue !== 'string') {
        return false;
      }

      const regexPattern = sqlWildcardToRegex(
        richTextFilter.blocknote.ilike ?? '',
      );
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'iu');

      return regexCaseInsensitive.test(targetValue);
    }
    case (richTextFilter as { ilike?: string }).ilike !== undefined: {
      const targetValue =
        typeof value === 'object' && value !== null
          ? (value.markdown ?? value.blocknote ?? '')
          : value;

      if (typeof targetValue !== 'string') {
        return false;
      }

      const regexPattern = sqlWildcardToRegex(
        (richTextFilter as { ilike: string }).ilike ?? '',
      );
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'iu');

      return regexCaseInsensitive.test(targetValue);
    }
    case (richTextFilter as { like?: string }).like !== undefined: {
      const targetValue =
        typeof value === 'object' && value !== null
          ? (value.markdown ?? value.blocknote ?? '')
          : value;

      if (typeof targetValue !== 'string') {
        return false;
      }

      const regexPattern = sqlWildcardToRegex(
        (richTextFilter as { like: string }).like ?? '',
      );
      const regexCaseSensitive = new RegExp(`^${regexPattern}$`, 'u');

      return regexCaseSensitive.test(targetValue);
    }
    default: {
      throw new Error(
        `Unexpected value for RICH_TEXT filter : ${JSON.stringify(richTextFilter)}`,
      );
    }
  }
};
