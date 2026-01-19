import { Temporal } from 'temporal-polyfill';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined, sortPlainDate } from 'twenty-shared/utils';

import { DATE_GRANULARITIES_WITHOUT_GAP_FILLING } from 'src/modules/dashboard/chart-data/constants/date-granularities-without-gap-filling.constant';
import { type SupportedDateGranularityForGapFilling } from 'src/modules/dashboard/chart-data/constants/supported-date-granularity-for-gap-filling.type';
import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { generateDateGroupsInRange } from 'src/modules/dashboard/chart-data/utils/generate-date-groups-in-range.util';

type FillDateGapsResult = {
  data: GroupByRawResult[];
  wasTruncated: boolean;
};

type FillDateGapsParams = {
  data: GroupByRawResult[];
  dateGranularity: ObjectRecordGroupByDateGranularity | null | undefined;
  isDescOrder?: boolean;
};

export const fillDateGaps = ({
  data,
  dateGranularity,
  isDescOrder = false,
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

  for (const item of data) {
    const dateValue = item.groupByDimensionValues?.[0];

    if (!isDefined(dateValue)) {
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

  const { dates: allDates, wasTruncated } = generateDateGroupsInRange({
    startDate: minDate,
    endDate: maxDate,
    granularity: dateGranularity as SupportedDateGranularityForGapFilling,
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

  return { data: filledData, wasTruncated };
};

type FillDateGapsTwoDimensionalParams = {
  data: GroupByRawResult[];
  dateGranularity: ObjectRecordGroupByDateGranularity | null | undefined;
  isDescOrder?: boolean;
};

export const fillDateGapsTwoDimensional = ({
  data,
  dateGranularity,
  isDescOrder = false,
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
  const uniqueSecondDimensionValues = new Set<unknown>();

  for (const item of data) {
    const dateValue = item.groupByDimensionValues?.[0];

    if (!isDefined(dateValue)) {
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

  const { dates: allDates, wasTruncated } = generateDateGroupsInRange({
    startDate: minDate,
    endDate: maxDate,
    granularity: dateGranularity as SupportedDateGranularityForGapFilling,
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

  return { data: filledData, wasTruncated };
};
