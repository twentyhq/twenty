import { type Temporal } from 'temporal-polyfill';
import {
  isDefined,
  isPlainDateAfter,
  isPlainDateBefore,
} from 'twenty-shared/utils';

import { type SupportedDateGranularityForGapFilling } from 'src/modules/dashboard/chart-data/constants/supported-date-granularity-for-gap-filling.type';
import { type DateRangeBounds } from 'src/modules/dashboard/chart-data/types/date-range-bounds.type';
import { generateDateGroupsInRange } from 'src/modules/dashboard/chart-data/utils/generate-date-groups-in-range.util';

// The chart keeps only the first buckets that fit, so a range beyond the budget would hide data buckets
export const generateDateGroupsCoveringRange = ({
  minDate,
  maxDate,
  dateRange,
  granularity,
  maximumNumberOfDateGroups,
}: {
  minDate: Temporal.PlainDate;
  maxDate: Temporal.PlainDate;
  dateRange: DateRangeBounds | undefined;
  granularity: SupportedDateGranularityForGapFilling;
  maximumNumberOfDateGroups: number;
}) => {
  const dataDateGroups = () =>
    generateDateGroupsInRange({
      startDate: minDate,
      endDate: maxDate,
      granularity,
    });

  const startDate =
    isDefined(dateRange?.start) && isPlainDateBefore(dateRange.start, minDate)
      ? dateRange.start
      : minDate;
  const endDate =
    isDefined(dateRange?.end) && isPlainDateAfter(dateRange.end, maxDate)
      ? dateRange.end
      : maxDate;

  if (startDate === minDate && endDate === maxDate) {
    return dataDateGroups();
  }

  const extendedDateGroups = generateDateGroupsInRange({
    startDate,
    endDate,
    granularity,
  });

  return extendedDateGroups.wasTruncated ||
    extendedDateGroups.dates.length > maximumNumberOfDateGroups
    ? dataDateGroups()
    : extendedDateGroups;
};
