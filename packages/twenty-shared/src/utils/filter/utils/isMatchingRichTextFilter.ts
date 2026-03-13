import { type RichTextFilter } from '@/types';
import escapeRegExp from 'lodash.escaperegexp';

export const isMatchingRichTextFilter = ({
  richTextFilter,
  value,
}: {
  richTextFilter: RichTextFilter;
  value: string;
}) => {
  switch (true) {
    case richTextFilter.markdown !== undefined: {
      const escapedPattern = escapeRegExp(richTextFilter.markdown.ilike);
      const regexPattern = escapedPattern.replace(/%/g, '.*');
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'i');

      return regexCaseInsensitive.test(value);
    }
    default: {
      throw new Error(
        `Unexpected value for RICH_TEXT_V2 filter : ${JSON.stringify(richTextFilter)}`,
      );
    }
  }
};
