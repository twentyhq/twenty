import {
  type ObjectRecordGroupByDateGranularity,
  type FirstDayOfTheWeek,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { formatDimensionValue } from 'src/modules/dashboard/chart-data/utils/format-dimension-value.util';

export type ProcessedOneDimensionalDataPoint = {
  formattedValue: string;
  rawValue: RawDimensionValue;
  aggregateValue: number;
};

export type ProcessOneDimensionalResultsOutput = {
  processedDataPoints: ProcessedOneDimensionalDataPoint[];
  formattedToRawLookup: Map<string, RawDimensionValue>;
};

type ProcessOneDimensionalResultsParams = {
  rawResults: GroupByRawResult[];
  primaryAxisGroupByField: FlatFieldMetadata;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
  subFieldName?: string | null;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};

export const processOneDimensionalResults = ({
  rawResults,
  primaryAxisGroupByField,
  dateGranularity,
  subFieldName,
  userTimezone,
  firstDayOfTheWeek,
}: ProcessOneDimensionalResultsParams): ProcessOneDimensionalResultsOutput => {
  const formattedToRawLookup = new Map<string, RawDimensionValue>();
  const processedDataPoints: ProcessedOneDimensionalDataPoint[] = [];

  for (const result of rawResults) {
    const dimensionValues = result.groupByDimensionValues;

    if (!isDefined(dimensionValues) || dimensionValues.length < 1) {
      continue;
    }

    const rawValue = dimensionValues[0] as RawDimensionValue;

    const formattedValue = formatDimensionValue({
      value: rawValue,
      fieldMetadata: primaryAxisGroupByField,
      dateGranularity: dateGranularity ?? undefined,
      subFieldName: subFieldName ?? undefined,
      userTimezone,
      firstDayOfTheWeek,
    });

    if (isDefined(rawValue)) {
      formattedToRawLookup.set(formattedValue, rawValue);
    }

    processedDataPoints.push({
      formattedValue,
      rawValue,
      aggregateValue: result.aggregateValue,
    });
  }

  return {
    processedDataPoints,
    formattedToRawLookup,
  };
};
