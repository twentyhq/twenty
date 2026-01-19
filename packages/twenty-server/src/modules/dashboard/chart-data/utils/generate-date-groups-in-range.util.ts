import { type Temporal } from 'temporal-polyfill';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import {
  assertUnreachable,
  isPlainDateBeforeOrEqual,
} from 'twenty-shared/utils';

import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from 'src/modules/dashboard/chart-data/constants/bar-chart-maximum-number-of-bars.constant';
import { type SupportedDateGranularityForGapFilling } from 'src/modules/dashboard/chart-data/constants/supported-date-granularity-for-gap-filling.type';

type GenerateDateGroupsInRangeParams = {
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  granularity: SupportedDateGranularityForGapFilling;
};

type GenerateDateGroupsInRangeResult = {
  dates: Temporal.PlainDate[];
  wasTruncated: boolean;
};

export const generateDateGroupsInRange = ({
  startDate,
  endDate,
  granularity,
}: GenerateDateGroupsInRangeParams): GenerateDateGroupsInRangeResult => {
  const dates: Temporal.PlainDate[] = [];

  let iterations = 0;
  let wasTruncated = false;

  let currentDateCursor = startDate;

  while (isPlainDateBeforeOrEqual(currentDateCursor, endDate)) {
    if (iterations >= BAR_CHART_MAXIMUM_NUMBER_OF_BARS) {
      wasTruncated = true;
      break;
    }

    dates.push(currentDateCursor);
    iterations++;

    switch (granularity) {
      case ObjectRecordGroupByDateGranularity.DAY:
        currentDateCursor = currentDateCursor.add({ days: 1 });
        break;

      case ObjectRecordGroupByDateGranularity.WEEK:
        currentDateCursor = currentDateCursor.add({ weeks: 1 });
        break;

      case ObjectRecordGroupByDateGranularity.MONTH:
        currentDateCursor = currentDateCursor.add({ months: 1 });
        break;

      case ObjectRecordGroupByDateGranularity.QUARTER:
        currentDateCursor = currentDateCursor.add({ months: 3 });
        break;

      case ObjectRecordGroupByDateGranularity.YEAR:
        currentDateCursor = currentDateCursor.add({ years: 1 });
        break;

      default:
        assertUnreachable(granularity);
    }
  }

  return { dates, wasTruncated };
};
