import { relativeDateFilterStringifiedSchema } from '@/utils/filter/dates/utils/relativeDateFilterStringifiedSchema';
import { resolveRelativeDateTimeFilter } from '@/utils/filter/dates/utils/resolveRelativeDateTimeFilter';
import { computeTimezoneDifferenceInMinutes } from '@/utils/filter/utils/computeTimezoneDifferenceInMinutes';
import { isDefined } from '@/utils/validation';
import { isNonEmptyString } from '@sniptt/guards';
import { addMinutes } from 'date-fns';

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
    const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const timezoneDifferenceInMinutesForStartDateToPreventDST =
      computeTimezoneDifferenceInMinutes(
        relativeDateFilter.timezone,
        systemTimeZone,
        relativeDateFilterWithDateRange.start,
      );

    const timezoneDifferenceInMinutesForEndDateToPreventDST =
      computeTimezoneDifferenceInMinutes(
        relativeDateFilter.timezone,
        systemTimeZone,
        relativeDateFilterWithDateRange.end,
      );

    const shiftedStartDate = addMinutes(
      relativeDateFilterWithDateRange.start,
      timezoneDifferenceInMinutesForStartDateToPreventDST,
    );

    const shiftedEndDate = addMinutes(
      relativeDateFilterWithDateRange.end,
      timezoneDifferenceInMinutesForEndDateToPreventDST,
    );

    return {
      ...relativeDateFilterWithDateRange,
      start: shiftedStartDate,
      end: shiftedEndDate,
    };
  }

  return relativeDateFilterWithDateRange;
};
