import { type RichTextFilter } from '@/types';
import { isDefined } from '@/utils/validation/isDefined';
import escapeRegExp from 'lodash.escaperegexp';

// postgres ILIKE treats a backslash as an escape for the next char (default
// escape char), so an escaped % or _ is a literal and must not become a
// wildcard, the walk parses escape sequences before the wildcard translation
const translateIlikeWildcards = (pattern: string): string => {
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

  // postgres rejects an ILIKE pattern ending with a lone escape char, the
  // mirror stays lenient and keeps it as a literal backslash
  if (isEscaped) {
    translated += escapeRegExp('\\');
  }

  return translated;
};

export const isMatchingRichTextFilter = ({
  richTextFilter,
  value,
}: {
  richTextFilter: RichTextFilter;
  value: string;
}) => {
  switch (true) {
    case richTextFilter.markdown !== undefined: {
      // a markdown leaf without ilike matches nothing in postgres (ILIKE NULL
      // is never true), the mirror returns false instead of coercing a string
      if (!isDefined(richTextFilter.markdown.ilike)) {
        return false;
      }

      // the u flag keeps both wildcards code-point based so postgres parity
      // holds for newline and astral values (% and _ match a\nc / a\ud83d\ude00c in postgres)
      const regexPattern = translateIlikeWildcards(
        richTextFilter.markdown.ilike,
      );
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'iu');

      return regexCaseInsensitive.test(value);
    }
    default: {
      throw new Error(
        `Unexpected value for RICH_TEXT filter : ${JSON.stringify(richTextFilter)}`,
      );
    }
  }
};
