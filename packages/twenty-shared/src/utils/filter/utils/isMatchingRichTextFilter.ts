import { type RichTextV2Filter } from '@/types';
import escapeRegExp from 'lodash.escaperegexp';

export const isMatchingRichTextV2Filter = ({
  richTextV2Filter,
  value,
}: {
  richTextV2Filter: RichTextV2Filter;
  value: string;
}) => {
  switch (true) {
    case richTextV2Filter.markdown !== undefined: {
      const escapedPattern = escapeRegExp(richTextV2Filter.markdown.ilike);
      const regexPattern = escapedPattern.replace(/%/g, '.*');
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'i');

      return regexCaseInsensitive.test(value);
    }
    default: {
      throw new Error(
        `Unexpected value for RICH_TEXT_V2 filter : ${JSON.stringify(richTextV2Filter)}`,
      );
    }
  }
};
