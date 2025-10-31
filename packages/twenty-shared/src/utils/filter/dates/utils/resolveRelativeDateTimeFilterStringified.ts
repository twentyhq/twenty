import { relativeDateFilterStringifiedSchema } from '@/utils/filter/dates/utils/relativeDateFilterStringifiedSchema';
import { resolveRelativeDateTimeFilter } from '@/utils/filter/dates/utils/resolveRelativeDateTimeFilter';
import { shiftPointInTimeFromTimezoneDifferenceInMinutesWithSystemTimezone } from '@/utils/filter/dates/utils/shiftPointInTimeFromTimezoneDifferenceInMinutesWithSystemTimezone';
import { isDefined } from '@/utils/validation';
import { isNonEmptyString } from '@sniptt/guards';

export const resolveRelativeDateTimeFilterStringified = (
  relativeDateTimeFilterStringified?: string | null,
) => {
  if (!isNonEmptyString(relativeDateTimeFilterStringified)) {
    return null;
  }

  const relativeDateFilter = relativeDateFilterStringifiedSchema.parse(
    relativeDateTimeFilterStringified,
  );

  const relativeDateFilterWithDateRange =
    resolveRelativeDateTimeFilter(relativeDateFilter);

  if (isDefined(relativeDateFilter.timezone)) {
    const shiftedStartDate =
      shiftPointInTimeFromTimezoneDifferenceInMinutesWithSystemTimezone(
        relativeDateFilterWithDateRange.start,
        relativeDateFilter.timezone,
        'add',
      );

    const shiftedEndDate =
      shiftPointInTimeFromTimezoneDifferenceInMinutesWithSystemTimezone(
        relativeDateFilterWithDateRange.end,
        relativeDateFilter.timezone,
        'add',
      );

    return {
      ...relativeDateFilterWithDateRange,
      start: shiftedStartDate,
      end: shiftedEndDate,
    };
  }

  return relativeDateFilterWithDateRange;
};
