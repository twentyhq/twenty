import { type RichTextFilter } from '@/types';
import escapeRegExp from 'lodash.escaperegexp';

export const isMatchingRichTextFilter = ({
  richTextFilter,
  value,
}: {
  richTextFilter: RichTextFilter;
  value: string | null;
}) => {
  switch (true) {
    case richTextFilter.markdown?.is !== undefined: {
      return richTextFilter.markdown.is === 'NULL'
        ? value === null
        : value !== null;
    }
    case richTextFilter.markdown?.ilike !== undefined: {
      if (value === null) {
        return false;
      }

      const escapedPattern = escapeRegExp(richTextFilter.markdown.ilike);
      const regexPattern = escapedPattern.replace(/%/g, '.*');
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'i');

      return regexCaseInsensitive.test(value);
    }
    default: {
      throw new Error(
        `Unexpected value for RICH_TEXT filter : ${JSON.stringify(richTextFilter)}`,
      );
    }
  }
};
