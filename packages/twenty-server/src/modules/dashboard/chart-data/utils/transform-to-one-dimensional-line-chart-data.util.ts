import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import { convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS } from 'src/modules/dashboard/chart-data/constants/line-chart-maximum-number-of-data-points.constant';
import { LineChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/line-chart-data.dto';
import { GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';
import { applyCumulativeToLineDataPoints } from 'src/modules/dashboard/chart-data/utils/apply-cumulative-to-line-data-points.util';
import { applyGapFilling } from 'src/modules/dashboard/chart-data/utils/apply-gap-filling.util';
import { buildFormattedToRawLookupDto } from 'src/modules/dashboard/chart-data/utils/build-formatted-to-raw-lookup-dto.util';
import { getAggregateOperationLabel } from 'src/modules/dashboard/chart-data/utils/get-aggregate-operation-label.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';
import { processOneDimensionalResults } from 'src/modules/dashboard/chart-data/utils/process-one-dimensional-results.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data-if-needed.util';

export const transformToOneDimensionalLineChartData = ({
  filteredRawResults,
  primaryAxisGroupByField,
  aggregateField,
  configuration,
  userTimezone,
  firstDayOfTheWeek,
  seriesIdPrefix,
  relationLabelResolution,
}: {
  filteredRawResults: GroupByRawResult[];
  primaryAxisGroupByField: FlatFieldMetadata;
  aggregateField: FlatFieldMetadata;
  configuration: LineChartConfigurationDTO;
  userTimezone: string;
  firstDayOfTheWeek: CalendarStartDay;
  seriesIdPrefix: string;
  relationLabelResolution: RelationLabelResolution | undefined;
}): LineChartDataDTO => {
  const isDescOrder =
    configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_DESC;

  const { data: gapFilledResults, wasTruncated: dateRangeWasTruncated } =
    applyGapFilling({
      data: filteredRawResults,
      primaryAxisGroupByField,
      dateGranularity: configuration.primaryAxisDateGranularity,
      omitNullValues: configuration.omitNullValues ?? false,
      isDescOrder,
      isTwoDimensional: false,
      splitMultiValueFields: configuration.splitMultiValueFields,
    });

  const selectOptions = getSelectOptions(primaryAxisGroupByField);

  const convertedFirstDayOfTheWeek =
    convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
      firstDayOfTheWeek,
      FirstDayOfTheWeek.SUNDAY,
    );

  const { processedDataPoints: rawProcessedDataPoints, formattedToRawLookup } =
    processOneDimensionalResults({
      rawResults: gapFilledResults,
      primaryAxisGroupByField,
      dateGranularity: configuration.primaryAxisDateGranularity,
      subFieldName: configuration.primaryAxisGroupBySubFieldName,
      userTimezone,
      firstDayOfTheWeek: convertedFirstDayOfTheWeek,
      relationLabelResolution,
    });

  const processedDataPoints = rawProcessedDataPoints.map((point) => ({
    x: point.formattedValue,
    y: point.aggregateValue,
    rawValue: point.rawValue,
  }));

  const sortedData = sortChartDataIfNeeded({
    data: processedDataPoints,
    orderBy: configuration.primaryAxisOrderBy,
    manualSortOrder: configuration.primaryAxisManualSortOrder,
    formattedToRawLookup,
    getFieldValue: (item) => item.x,
    getNumericValue: (item) => item.y ?? 0,
    selectFieldOptions: selectOptions,
    fieldType: primaryAxisGroupByField.type,
    subFieldName: configuration.primaryAxisGroupBySubFieldName ?? undefined,
    dateGranularity: configuration.primaryAxisDateGranularity,
  });

  const limitedSortedData = sortedData.slice(
    0,
    LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS,
  );

  const transformedData = configuration.isCumulative
    ? applyCumulativeToLineDataPoints(limitedSortedData)
    : limitedSortedData;

  const dataPoints = transformedData.map(({ x, y }) => ({
    x,
    y,
  }));

  const series = [
    {
      key: `${seriesIdPrefix}${aggregateField.name}`,
      label: aggregateField.label,
      data: dataPoints,
    },
  ];

  const xAxisLabel = primaryAxisGroupByField.label;
  const yAxisLabel = `${getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`;

  return {
    series,
    xAxisLabel,
    yAxisLabel,
    showLegend: configuration.displayLegend ?? true,
    showDataLabels: configuration.displayDataLabel ?? false,
    hasTooManyGroups:
      filteredRawResults.length > LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS ||
      dateRangeWasTruncated,
    formattedToRawLookup: buildFormattedToRawLookupDto({
      axisLookups: [{ formattedToRawLookup, relationLabelResolution }],
    }),
  };
};
