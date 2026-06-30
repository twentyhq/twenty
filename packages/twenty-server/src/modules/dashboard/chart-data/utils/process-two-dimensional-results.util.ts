import {
  type ObjectRecordGroupByDateGranularity,
  type FirstDayOfTheWeek,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { formatDimensionValue } from 'src/modules/dashboard/chart-data/utils/format-dimension-value.util';

export type ProcessedTwoDimensionalDataPoint = {
  xFormatted: string;
  yFormatted: string;
  rawXValue: RawDimensionValue;
  rawYValue: RawDimensionValue;
  aggregateValue: number;
};

export type ProcessTwoDimensionalResultsOutput = {
  processedDataPoints: ProcessedTwoDimensionalDataPoint[];
  formattedToRawLookup: Map<string, RawDimensionValue>;
  secondaryFormattedToRawLookup: Map<string, RawDimensionValue>;
};

type ProcessTwoDimensionalResultsParams = {
  rawResults: GroupByRawResult[];
  primaryAxisGroupByField: FlatFieldMetadata;
  secondaryAxisGroupByField: FlatFieldMetadata;
  primaryDateGranularity?: ObjectRecordGroupByDateGranularity | null;
  primarySubFieldName?: string | null;
  secondaryDateGranularity?: ObjectRecordGroupByDateGranularity | null;
  secondarySubFieldName?: string | null;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};

export const processTwoDimensionalResults = ({
  rawResults,
  primaryAxisGroupByField,
  secondaryAxisGroupByField,
  primaryDateGranularity,
  primarySubFieldName,
  secondaryDateGranularity,
  secondarySubFieldName,
  userTimezone,
  firstDayOfTheWeek,
}: ProcessTwoDimensionalResultsParams): ProcessTwoDimensionalResultsOutput => {
  const formattedToRawLookup = new Map<string, RawDimensionValue>();
  const secondaryFormattedToRawLookup = new Map<string, RawDimensionValue>();
  const processedDataPoints: ProcessedTwoDimensionalDataPoint[] = [];

  for (const result of rawResults) {
    const dimensionValues = result.groupByDimensionValues;

    if (!isDefined(dimensionValues) || dimensionValues.length < 2) {
      continue;
    }

    const rawXValue = dimensionValues[0] as RawDimensionValue;
    const rawYValue = dimensionValues[1] as RawDimensionValue;

    const xFormatted = formatDimensionValue({
      value: rawXValue,
      fieldMetadata: primaryAxisGroupByField,
      dateGranularity: primaryDateGranularity ?? undefined,
      subFieldName: primarySubFieldName ?? undefined,
      userTimezone,
      firstDayOfTheWeek,
    });

    const yFormatted = formatDimensionValue({
      value: rawYValue,
      fieldMetadata: secondaryAxisGroupByField,
      dateGranularity: secondaryDateGranularity ?? undefined,
      subFieldName: secondarySubFieldName ?? undefined,
      userTimezone,
      firstDayOfTheWeek,
    });

    if (isDefined(rawXValue)) {
      formattedToRawLookup.set(xFormatted, rawXValue);
    }

    if (isDefined(rawYValue)) {
      secondaryFormattedToRawLookup.set(yFormatted, rawYValue);
    }

    processedDataPoints.push({
      xFormatted,
      yFormatted,
      rawXValue,
      rawYValue,
      aggregateValue: result.aggregateValue,
    });
  }

  return {
    processedDataPoints,
    formattedToRawLookup,
    secondaryFormattedToRawLookup,
  };
};
