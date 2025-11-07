import { relativeDateFilterStringifiedSchema } from '@/utils/filter/dates/utils/relativeDateFilterStringifiedSchema';
import { resolveRelativeDateFilter } from '@/utils/filter/dates/utils/resolveRelativeDateFilter';
import { isNonEmptyString } from '@sniptt/guards';

export const resolveRelativeDateFilterStringified = (
  relativeDateFilterStringified?: string | null,
) => {
  if (!isNonEmptyString(relativeDateFilterStringified)) {
    return null;
  }

  const relativeDateFilter = relativeDateFilterStringifiedSchema.parse(
    relativeDateFilterStringified,
  );

  const relativeDateFilterWithDateRange =
    resolveRelativeDateFilter(relativeDateFilter);

  return relativeDateFilterWithDateRange;
};
