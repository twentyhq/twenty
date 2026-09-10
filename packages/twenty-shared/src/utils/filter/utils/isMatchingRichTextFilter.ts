import { type RichTextFilter } from '@/types';
import escapeRegExp from 'lodash.escaperegexp';

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

      const escapedPattern = escapeRegExp(richTextFilter.markdown.ilike ?? '');
      const regexPattern = escapedPattern
        .replace(/%/g, '.*')
        .replace(/_/g, '.');
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'is');

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

      const escapedPattern = escapeRegExp(richTextFilter.blocknote.ilike ?? '');
      const regexPattern = escapedPattern
        .replace(/%/g, '.*')
        .replace(/_/g, '.');
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'is');

      return regexCaseInsensitive.test(targetValue);
    }
    default: {
      throw new Error(
        `Unexpected value for RICH_TEXT filter : ${JSON.stringify(richTextFilter)}`,
      );
    }
  }
};
