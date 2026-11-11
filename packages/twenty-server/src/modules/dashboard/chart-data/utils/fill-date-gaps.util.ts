import { Temporal } from 'temporal-polyfill';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined, sortPlainDate } from 'twenty-shared/utils';

import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from 'src/modules/dashboard/chart-data/constants/bar-chart-maximum-number-of-bars.constant';
import { BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR } from 'src/modules/dashboard/chart-data/constants/bar-chart-maximum-number-of-groups-per-bar.constant';
import { DATE_GRANULARITIES_WITHOUT_GAP_FILLING } from 'src/modules/dashboard/chart-data/constants/date-granularities-without-gap-filling.constant';
import { type SupportedDateGranularityForGapFilling } from 'src/modules/dashboard/chart-data/constants/supported-date-granularity-for-gap-filling.type';
import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { type DateRangeBounds } from 'src/modules/dashboard/chart-data/types/date-range-bounds.type';
import { generateDateGroupsCoveringRange } from 'src/modules/dashboard/chart-data/utils/generate-date-groups-covering-range.util';

type FillDateGapsResult = {
  data: GroupByRawResult[];
  wasTruncated: boolean;
};

type FillDateGapsParams = {
  data: GroupByRawResult[];
  dateGranularity: ObjectRecordGroupByDateGranularity | null | undefined;
  isDescOrder?: boolean;
  dateRange?: DateRangeBounds;
};

export const fillDateGaps = ({
  data,
  dateGranularity,
  isDescOrder = false,
  dateRange,
}: FillDateGapsParams): FillDateGapsResult => {
  if (data.length === 0) {
    return { data, wasTruncated: false };
  }

  if (
    !isDefined(dateGranularity) ||
    DATE_GRANULARITIES_WITHOUT_GAP_FILLING.has(dateGranularity)
  ) {
    return { data, wasTruncated: false };
  }

  const existingDateGroupsMap = new Map<string, GroupByRawResult>();
  const parsedDates: Temporal.PlainDate[] = [];
  const notSetGroups: GroupByRawResult[] = [];

  for (const item of data) {
    const dateValue = item.groupByDimensionValues?.[0];

    if (!isDefined(dateValue)) {
      notSetGroups.push(item);
      continue;
    }

    const parsedDate = Temporal.PlainDate.from(String(dateValue));

    parsedDates.push(parsedDate);
    existingDateGroupsMap.set(parsedDate.toString(), item);
  }

  if (parsedDates.length === 0) {
    return { data, wasTruncated: false };
  }

  const sortedPlainDates = [...parsedDates].sort(sortPlainDate('asc'));

  const minDate = sortedPlainDates[0];
  const maxDate = sortedPlainDates[sortedPlainDates.length - 1];

  if (!isDefined(minDate) || !isDefined(maxDate)) {
    return { data, wasTruncated: false };
  }

  const { dates: allDates, wasTruncated } = generateDateGroupsCoveringRange({
    minDate,
    maxDate,
    dateRange,
    granularity: dateGranularity as SupportedDateGranularityForGapFilling,
    maximumNumberOfDateGroups: BAR_CHART_MAXIMUM_NUMBER_OF_BARS,
  });

  const orderedDates = isDescOrder ? [...allDates].reverse() : allDates;

  const filledData = orderedDates.map((date) => {
    const key = date.toString();
    const existingDateGroup = existingDateGroupsMap.get(key);

    if (isDefined(existingDateGroup)) {
      return existingDateGroup;
    }

    return {
      groupByDimensionValues: [date.toString()],
      aggregateValue: 0,
    };
  });

  return { data: [...filledData, ...notSetGroups], wasTruncated };
};

type FillDateGapsTwoDimensionalParams = {
  data: GroupByRawResult[];
  dateGranularity: ObjectRecordGroupByDateGranularity | null | undefined;
  isDescOrder?: boolean;
  dateRange?: DateRangeBounds;
  maximumNumberOfSegments?: number;
};

export const fillDateGapsTwoDimensional = ({
  data,
  dateGranularity,
  isDescOrder = false,
  dateRange,
  maximumNumberOfSegments,
}: FillDateGapsTwoDimensionalParams): FillDateGapsResult => {
  if (data.length === 0) {
    return { data, wasTruncated: false };
  }

  if (
    !isDefined(dateGranularity) ||
    DATE_GRANULARITIES_WITHOUT_GAP_FILLING.has(dateGranularity)
  ) {
    return { data, wasTruncated: false };
  }

  const existingDateGroupsMap = new Map<string, GroupByRawResult>();
  const parsedDates: Temporal.PlainDate[] = [];
  const notSetGroups: GroupByRawResult[] = [];
  const uniqueSecondDimensionValues = new Set<unknown>();

  for (const item of data) {
    const dateValue = item.groupByDimensionValues?.[0];

    if (!isDefined(dateValue)) {
      notSetGroups.push(item);
      continue;
    }

    const parsedDate = Temporal.PlainDate.from(String(dateValue));

    parsedDates.push(parsedDate);

    const secondDimensionValue = item.groupByDimensionValues?.[1] ?? null;

    uniqueSecondDimensionValues.add(secondDimensionValue);

    const key = `${parsedDate.toString()}_${String(secondDimensionValue)}`;

    existingDateGroupsMap.set(key, item);
  }

  if (parsedDates.length === 0) {
    return { data, wasTruncated: false };
  }

  const sortedPlainDates = [...parsedDates].sort(sortPlainDate('asc'));

  const minDate = sortedPlainDates[0];
  const maxDate = sortedPlainDates[sortedPlainDates.length - 1];

  if (!isDefined(minDate) || !isDefined(maxDate)) {
    return { data, wasTruncated: false };
  }

  const { dates: allDates, wasTruncated } = generateDateGroupsCoveringRange({
    minDate,
    maxDate,
    dateRange,
    granularity: dateGranularity as SupportedDateGranularityForGapFilling,
    maximumNumberOfDateGroups: isDefined(maximumNumberOfSegments)
      ? Math.floor(
          maximumNumberOfSegments /
            Math.min(
              uniqueSecondDimensionValues.size,
              BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR,
            ),
        )
      : BAR_CHART_MAXIMUM_NUMBER_OF_BARS,
  });

  const orderedDates = isDescOrder ? [...allDates].reverse() : allDates;

  const filledData = orderedDates.flatMap((date) =>
    Array.from(uniqueSecondDimensionValues).map((secondDimensionValue) => {
      const key = `${date.toString()}_${String(secondDimensionValue)}`;
      const existingDateGroup = existingDateGroupsMap.get(key);

      if (isDefined(existingDateGroup)) {
        return existingDateGroup;
      }

      return {
        groupByDimensionValues: [date.toString(), secondDimensionValue],
        aggregateValue: 0,
      };
    }),
  );

  return { data: [...filledData, ...notSetGroups], wasTruncated };
};
