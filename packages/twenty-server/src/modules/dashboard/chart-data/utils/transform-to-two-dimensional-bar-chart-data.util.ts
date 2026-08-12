import { isNumber } from '@sniptt/guards';
import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  capitalize,
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
} from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from 'src/modules/dashboard/chart-data/constants/bar-chart-maximum-number-of-bars.constant';
import { BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR } from 'src/modules/dashboard/chart-data/constants/bar-chart-maximum-number-of-groups-per-bar.constant';
import { BarChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/bar-chart-data.dto';
import { GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';
import { applyCumulativeToTwoDimensionalBarData } from 'src/modules/dashboard/chart-data/utils/apply-cumulative-to-two-dimensional-bar-data.util';
import { applyGapFilling } from 'src/modules/dashboard/chart-data/utils/apply-gap-filling.util';
import { buildFormattedToRawLookupDto } from 'src/modules/dashboard/chart-data/utils/build-formatted-to-raw-lookup-dto.util';
import { getAggregateOperationLabel } from 'src/modules/dashboard/chart-data/utils/get-aggregate-operation-label.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';
import { processTwoDimensionalResults } from 'src/modules/dashboard/chart-data/utils/process-two-dimensional-results.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data-if-needed.util';
import { sortSecondaryAxisKeys } from 'src/modules/dashboard/chart-data/utils/sort-secondary-axis-keys.util';

export const transformToTwoDimensionalBarChartData = ({
  filteredRawResults,
  primaryAxisGroupByField,
  secondaryAxisGroupByField,
  aggregateField,
  configuration,
  userTimezone,
  firstDayOfTheWeek,
  primaryRelationLabelResolution,
  secondaryRelationLabelResolution,
}: {
  filteredRawResults: GroupByRawResult[];
  primaryAxisGroupByField: FlatFieldMetadata;
  secondaryAxisGroupByField: FlatFieldMetadata;
  aggregateField: FlatFieldMetadata;
  configuration: BarChartConfigurationDTO;
  userTimezone: string;
  firstDayOfTheWeek: CalendarStartDay;
  primaryRelationLabelResolution: RelationLabelResolution | undefined;
  secondaryRelationLabelResolution: RelationLabelResolution | undefined;
}): BarChartDataDTO => {
  const layout = configuration.layout ?? BarChartLayout.VERTICAL;
  const isHorizontal = layout === BarChartLayout.HORIZONTAL;

  const effectiveGroupMode =
    configuration.groupMode ?? BarChartGroupMode.STACKED;
  const isStacked = effectiveGroupMode === BarChartGroupMode.STACKED;

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

  const indexByKey = configuration.primaryAxisGroupBySubFieldName
    ? `${primaryAxisGroupByField.name}${capitalize(configuration.primaryAxisGroupBySubFieldName)}`
    : primaryAxisGroupByField.name;

  const convertedFirstDayOfTheWeek =
    convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
      firstDayOfTheWeek,
      FirstDayOfTheWeek.SUNDAY,
    );

  const {
    processedDataPoints,
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

  const allSecondaryValues = new Set<string>();

  for (const point of processedDataPoints) {
    allSecondaryValues.add(point.yFormatted);
  }

  const dataMap = new Map<string, Record<string, string | number>>();

  for (const point of processedDataPoints) {
    if (!dataMap.has(point.xFormatted)) {
      dataMap.set(point.xFormatted, {
        [indexByKey]: point.xFormatted,
      });
    }

    const datum = dataMap.get(point.xFormatted)!;

    datum[point.yFormatted] = point.aggregateValue;
  }

  let unsortedData = Array.from(dataMap.values());

  const sortedData = sortChartDataIfNeeded({
    data: unsortedData,
    orderBy: configuration.primaryAxisOrderBy,
    manualSortOrder: configuration.primaryAxisManualSortOrder,
    formattedToRawLookup,
    getFieldValue: (item) => String(item[indexByKey]),
    getNumericValue: (item) => {
      let sum = 0;

      for (const key of allSecondaryValues) {
        const value = item[key];

        if (isNumber(value)) {
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

  const limitedData = sortedData.slice(0, BAR_CHART_MAXIMUM_NUMBER_OF_BARS);

  const keys = Array.from(allSecondaryValues);

  const sortedKeys = sortSecondaryAxisKeys({
    keys,
    data: limitedData,
    configuration,
    secondaryFormattedToRawLookup,
    secondarySelectOptions,
    secondaryAxisGroupByField,
  });

  const hasTooManyBars = sortedData.length > BAR_CHART_MAXIMUM_NUMBER_OF_BARS;
  const hasTooManyGroupsPerBar =
    keys.length > BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR;

  let finalLimitedData = limitedData;
  const limitedKeys = sortedKeys.slice(
    0,
    BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR,
  );

  if (!isStacked) {
    const totalSegments = finalLimitedData.length * limitedKeys.length;
    const hasTooManySegments = totalSegments > BAR_CHART_MAXIMUM_NUMBER_OF_BARS;

    if (hasTooManySegments) {
      const maxXValues = Math.floor(
        BAR_CHART_MAXIMUM_NUMBER_OF_BARS / limitedKeys.length,
      );

      finalLimitedData = finalLimitedData.slice(0, Math.max(1, maxXValues));
    }
  }

  const finalData = configuration.isCumulative
    ? applyCumulativeToTwoDimensionalBarData({
        data: finalLimitedData,
        keys: limitedKeys,
      })
    : finalLimitedData;

  const series = limitedKeys.map((key) => ({
    key,
    label: key,
  }));

  const categoryLabel = primaryAxisGroupByField.label;
  const valueLabel = `${getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`;

  const xAxisLabel = isHorizontal ? valueLabel : categoryLabel;
  const yAxisLabel = isHorizontal ? categoryLabel : valueLabel;

  let hasTooManyGroups = hasTooManyBars || hasTooManyGroupsPerBar;

  if (!isStacked) {
    const totalSegments = limitedData.length * limitedKeys.length;
    const hasTooManySegments = totalSegments > BAR_CHART_MAXIMUM_NUMBER_OF_BARS;

    hasTooManyGroups = hasTooManyGroups || hasTooManySegments;
  }

  hasTooManyGroups = hasTooManyGroups || dateRangeWasTruncated;

  return {
    data: finalData,
    indexBy: indexByKey,
    keys: limitedKeys,
    series,
    xAxisLabel,
    yAxisLabel,
    showLegend: configuration.displayLegend ?? true,
    showDataLabels: configuration.displayDataLabel ?? false,
    layout,
    groupMode: configuration.groupMode ?? BarChartGroupMode.GROUPED,
    hasTooManyGroups,
    formattedToRawLookup: buildFormattedToRawLookupDto({
      axisLookups: [
        {
          formattedToRawLookup: secondaryFormattedToRawLookup,
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
