import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  isDefined,
} from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS } from 'src/modules/dashboard/chart-data/constants/line-chart-maximum-number-of-data-points.constant';
import { LINE_CHART_MAXIMUM_NUMBER_OF_NON_STACKED_SERIES } from 'src/modules/dashboard/chart-data/constants/line-chart-maximum-number-of-non-stacked-series.constant';
import { LINE_CHART_MAXIMUM_NUMBER_OF_STACKED_SERIES } from 'src/modules/dashboard/chart-data/constants/line-chart-maximum-number-of-stacked-series.constant';
import { LineChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/line-chart-data.dto';
import { GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';
import { applyCumulativeToLineDataPoints } from 'src/modules/dashboard/chart-data/utils/apply-cumulative-to-line-data-points.util';
import { applyGapFilling } from 'src/modules/dashboard/chart-data/utils/apply-gap-filling.util';
import { buildFormattedToRawLookupDto } from 'src/modules/dashboard/chart-data/utils/build-formatted-to-raw-lookup-dto.util';
import { getAggregateOperationLabel } from 'src/modules/dashboard/chart-data/utils/get-aggregate-operation-label.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';
import { processTwoDimensionalResults } from 'src/modules/dashboard/chart-data/utils/process-two-dimensional-results.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data-if-needed.util';
import { sortLineChartSecondaryAxisSeriesIds } from 'src/modules/dashboard/chart-data/utils/sort-line-chart-secondary-axis-series-ids.util';

export const transformToTwoDimensionalLineChartData = ({
  filteredRawResults,
  primaryAxisGroupByField,
  secondaryAxisGroupByField,
  aggregateField,
  configuration,
  userTimezone,
  firstDayOfTheWeek,
  seriesIdPrefix,
  primaryRelationLabelResolution,
  secondaryRelationLabelResolution,
}: {
  filteredRawResults: GroupByRawResult[];
  primaryAxisGroupByField: FlatFieldMetadata;
  secondaryAxisGroupByField: FlatFieldMetadata;
  aggregateField: FlatFieldMetadata;
  configuration: LineChartConfigurationDTO;
  userTimezone: string;
  firstDayOfTheWeek: CalendarStartDay;
  seriesIdPrefix: string;
  primaryRelationLabelResolution: RelationLabelResolution | undefined;
  secondaryRelationLabelResolution: RelationLabelResolution | undefined;
}): LineChartDataDTO => {
  const isStacked = configuration.isStacked ?? false;

  const isDescOrder =
    configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_DESC;

  const { data: gapFilledResults, wasTruncated: dateRangeWasTruncated } =
    applyGapFilling({
      data: filteredRawResults,
      primaryAxisGroupByField,
      dateGranularity: configuration.primaryAxisDateGranularity,
      omitNullValues: configuration.omitNullValues ?? false,
      isDescOrder,
      isTwoDimensional: true,
      splitMultiValueFields: configuration.splitMultiValueFields,
    });

  const primarySelectOptions = getSelectOptions(primaryAxisGroupByField);
  const secondarySelectOptions = getSelectOptions(secondaryAxisGroupByField);

  const convertedFirstDayOfTheWeek =
    convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
      firstDayOfTheWeek,
      FirstDayOfTheWeek.SUNDAY,
    );

  const {
    processedDataPoints: rawProcessedDataPoints,
    formattedToRawLookup,
    secondaryFormattedToRawLookup,
  } = processTwoDimensionalResults({
    rawResults: gapFilledResults,
    primaryAxisGroupByField,
    secondaryAxisGroupByField,
    primaryDateGranularity: configuration.primaryAxisDateGranularity,
    primarySubFieldName: configuration.primaryAxisGroupBySubFieldName,
    secondaryDateGranularity: configuration.secondaryAxisGroupByDateGranularity,
    secondarySubFieldName: configuration.secondaryAxisGroupBySubFieldName,
    userTimezone,
    firstDayOfTheWeek: convertedFirstDayOfTheWeek,
    primaryRelationLabelResolution,
    secondaryRelationLabelResolution,
  });

  const allXValues: string[] = [];
  const xValueSet = new Set<string>();
  const allSeriesIds = new Set<string>();

  const processedDataPoints = rawProcessedDataPoints.map((point) => {
    if (!xValueSet.has(point.xFormatted)) {
      xValueSet.add(point.xFormatted);
      allXValues.push(point.xFormatted);
    }

    allSeriesIds.add(point.yFormatted);

    return {
      xFormatted: point.xFormatted,
      ySeriesId: point.yFormatted,
      rawXValue: point.rawXValue,
      rawYValue: point.rawYValue,
      aggregateValue: point.aggregateValue,
    };
  });

  const seriesMap = new Map<string, Map<string, number>>();

  for (const point of processedDataPoints) {
    if (!seriesMap.has(point.ySeriesId)) {
      seriesMap.set(point.ySeriesId, new Map());
    }

    seriesMap.get(point.ySeriesId)!.set(point.xFormatted, point.aggregateValue);
  }

  const sortedXValues = sortChartDataIfNeeded({
    data: allXValues,
    orderBy: configuration.primaryAxisOrderBy,
    manualSortOrder: configuration.primaryAxisManualSortOrder,
    formattedToRawLookup,
    getFieldValue: (x) => x,
    getNumericValue: (xValue) => {
      let sum = 0;

      for (const xToYMap of seriesMap.values()) {
        const value = xToYMap.get(xValue);

        if (isDefined(value)) {
          sum += value;
        }
      }

      return sum;
    },
    selectFieldOptions: primarySelectOptions,
    fieldType: primaryAxisGroupByField.type,
    subFieldName: configuration.primaryAxisGroupBySubFieldName ?? undefined,
    dateGranularity: configuration.primaryAxisDateGranularity,
  });

  const limitedXValues = sortedXValues.slice(
    0,
    LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS,
  );

  const seriesIds = Array.from(allSeriesIds);

  const sortedSeriesIds = sortLineChartSecondaryAxisSeriesIds({
    seriesIds,
    seriesMap,
    configuration,
    secondaryFormattedToRawLookup,
    secondarySelectOptions,
    secondaryAxisGroupByField,
  });

  const maxSeries = isStacked
    ? LINE_CHART_MAXIMUM_NUMBER_OF_STACKED_SERIES
    : LINE_CHART_MAXIMUM_NUMBER_OF_NON_STACKED_SERIES;

  const limitedSeriesIds = sortedSeriesIds.slice(0, maxSeries);

  const series = limitedSeriesIds.map((seriesId) => {
    const xToYMap = seriesMap.get(seriesId) ?? new Map();
    const prefixedSeriesId = `${seriesIdPrefix}${seriesId}`;

    let dataPoints = limitedXValues.map((xValue) => ({
      x: xValue,
      y: xToYMap.get(xValue) ?? 0,
    }));

    if (configuration.isCumulative) {
      dataPoints = applyCumulativeToLineDataPoints(dataPoints);
    }

    return {
      key: prefixedSeriesId,
      label: seriesId,
      data: dataPoints,
    };
  });

  const xAxisLabel = primaryAxisGroupByField.label;
  const yAxisLabel = `${getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`;

  const hasTooManySeries = seriesIds.length > maxSeries;
  const hasTooManyDataPoints =
    allXValues.length > LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS;
  const hasTooManyGroups =
    hasTooManySeries || hasTooManyDataPoints || dateRangeWasTruncated;

  const secondaryLookupWithPrefixedSeriesIds = new Map<
    string,
    RawDimensionValue
  >();

  for (const seriesId of limitedSeriesIds) {
    const rawValue = secondaryFormattedToRawLookup.get(seriesId);

    if (isDefined(rawValue)) {
      secondaryLookupWithPrefixedSeriesIds.set(
        `${seriesIdPrefix}${seriesId}`,
        rawValue,
      );
    }
  }

  return {
    series,
    xAxisLabel,
    yAxisLabel,
    showLegend: configuration.displayLegend ?? true,
    showDataLabels: configuration.displayDataLabel ?? false,
    hasTooManyGroups,
    formattedToRawLookup: buildFormattedToRawLookupDto({
      axisLookups: [
        {
          formattedToRawLookup: secondaryLookupWithPrefixedSeriesIds,
          relationLabelResolution: secondaryRelationLabelResolution,
        },
        {
          formattedToRawLookup,
          relationLabelResolution: primaryRelationLabelResolution,
        },
      ],
    }),
  };
};
