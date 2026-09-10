import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  isDefined,
} from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from 'src/modules/dashboard/chart-data/constants/pie-chart-maximum-number-of-slices.constant';
import { PieChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/pie-chart-data.dto';
import { RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';
import { buildFormattedToRawLookupDto } from 'src/modules/dashboard/chart-data/utils/build-formatted-to-raw-lookup-dto.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';
import { processOneDimensionalResults } from 'src/modules/dashboard/chart-data/utils/process-one-dimensional-results.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data-if-needed.util';

export const transformToPieChartData = ({
  filteredRawResults,
  groupByField,
  configuration,
  userTimezone,
  firstDayOfTheWeek,
  relationLabelResolution,
}: {
  filteredRawResults: Array<{
    groupByDimensionValues: unknown[];
    aggregateValue: number;
  }>;
  groupByField: FlatFieldMetadata;
  configuration: PieChartConfigurationDTO;
  userTimezone: string;
  firstDayOfTheWeek: CalendarStartDay;
  relationLabelResolution: RelationLabelResolution | undefined;
}): PieChartDataDTO => {
  const selectOptions = getSelectOptions(groupByField);

  const convertedFirstDayOfTheWeek =
    convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
      firstDayOfTheWeek,
      FirstDayOfTheWeek.SUNDAY,
    );

  const { processedDataPoints: rawProcessedDataPoints, formattedToRawLookup } =
    processOneDimensionalResults({
      rawResults: filteredRawResults,
      primaryAxisGroupByField: groupByField,
      dateGranularity: configuration.dateGranularity,
      subFieldName: configuration.groupBySubFieldName,
      userTimezone,
      firstDayOfTheWeek: convertedFirstDayOfTheWeek,
      relationLabelResolution,
    });

  const processedDataPoints = rawProcessedDataPoints.map((point) => {
    const rawValueString = isDefined(point.rawValue)
      ? String(point.rawValue)
      : null;

    return {
      key: point.formattedValue,
      value: point.aggregateValue,
      rawValue: rawValueString,
    };
  });

  const sortedData = sortChartDataIfNeeded({
    data: processedDataPoints,
    orderBy: configuration.orderBy,
    manualSortOrder: configuration.manualSortOrder,
    formattedToRawLookup,
    getFieldValue: (item) => item.key,
    getNumericValue: (item) => item.value,
    selectFieldOptions: selectOptions,
    fieldType: groupByField.type,
    dateGranularity: configuration.dateGranularity,
  });

  const limitedSortedData = sortedData.slice(
    0,
    PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
  );

  const data = limitedSortedData.map(
    ({ rawValue: _rawValue, ...item }) => item,
  );

  return {
    data,
    showLegend: configuration.displayLegend ?? true,
    showDataLabels: configuration.displayDataLabel ?? false,
    showCenterMetric: configuration.showCenterMetric ?? true,
    hasTooManyGroups:
      filteredRawResults.length > PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
    formattedToRawLookup: buildFormattedToRawLookupDto({
      axisLookups: [{ formattedToRawLookup, relationLabelResolution }],
    }),
  };
};
