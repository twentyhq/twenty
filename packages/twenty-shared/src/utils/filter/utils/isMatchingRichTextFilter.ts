import { type RichTextFilter } from '@/types';
import { isDefined } from '@/utils/validation';
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
        ? !isDefined(value)
        : isDefined(value);
    }
    case richTextFilter.markdown?.ilike !== undefined: {
      if (!isDefined(value)) {
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
