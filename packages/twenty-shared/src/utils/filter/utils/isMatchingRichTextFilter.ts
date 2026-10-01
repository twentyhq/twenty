import { type RichTextFilter } from '@/types';
import { convertLikePatternToRegexOrThrow } from '@/utils/filter/utils/convertLikePatternToRegexOrThrow';
import { isDefined } from '@/utils/validation/isDefined';

export const isMatchingRichTextFilter = ({
  richTextFilter,
  value,
}: {
  richTextFilter: RichTextFilter;
  value: string;
}) => {
  switch (true) {
    case richTextFilter.markdown !== undefined: {
      if (!isDefined(richTextFilter.markdown.ilike)) {
        return false;
      }

      const regexCaseInsensitive = convertLikePatternToRegexOrThrow({
        pattern: richTextFilter.markdown.ilike,
        isCaseInsensitive: true,
      });

      return regexCaseInsensitive.test(value);
    }
    default: {
      throw new Error(
        `Unexpected value for RICH_TEXT filter : ${JSON.stringify(richTextFilter)}`,
      );
    }
  }
};
