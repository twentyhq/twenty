import { Injectable } from '@nestjs/common';

import { isNumber } from '@sniptt/guards';
import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  isDefined,
} from 'twenty-shared/utils';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from 'src/modules/dashboard/chart-data/constants/bar-chart-maximum-number-of-bars.constant';
import { BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR } from 'src/modules/dashboard/chart-data/constants/bar-chart-maximum-number-of-groups-per-bar.constant';
import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from 'src/modules/dashboard/chart-data/constants/extra-item-to-detect-too-many-groups.constant';
import { BarChartDataOutputDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/bar-chart-data-output.dto';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';
import { FieldMetadataOption } from 'src/modules/dashboard/chart-data/types/field-metadata-option.type';
import { GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { applyGapFilling } from 'src/modules/dashboard/chart-data/utils/apply-gap-filling.util';
import { filterByRange } from 'src/modules/dashboard/chart-data/utils/filter-by-range.util';
import { filterTwoDimensionalDataByRange } from 'src/modules/dashboard/chart-data/utils/filter-two-dimensional-data-by-range.util';
import { getAggregateOperationLabel } from 'src/modules/dashboard/chart-data/utils/get-aggregate-operation-label.util';
import { getFieldMetadata } from 'src/modules/dashboard/chart-data/utils/get-field-metadata.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';
import { processOneDimensionalResults } from 'src/modules/dashboard/chart-data/utils/process-one-dimensional-results.util';
import { processTwoDimensionalResults } from 'src/modules/dashboard/chart-data/utils/process-two-dimensional-results.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data-if-needed.util';
import { sortSecondaryAxisData } from 'src/modules/dashboard/chart-data/utils/sort-secondary-axis-data.util';

type GetBarChartDataParams = {
  workspaceId: string;
  objectMetadataId: string;
  configuration: BarChartConfigurationDTO;
  authContext: AuthContext;
};

@Injectable()
export class BarChartDataService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly chartDataQueryService: ChartDataQueryService,
  ) {}

  async getBarChartData({
    workspaceId,
    objectMetadataId,
    configuration,
    authContext,
  }: GetBarChartDataParams): Promise<BarChartDataOutputDTO> {
    try {
      const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
        await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
          },
        );

      if (!isDefined(objectMetadataId)) {
        throw new ChartDataException(
          generateChartDataExceptionMessage(
            ChartDataExceptionCode.OBJECT_METADATA_NOT_FOUND,
            'Widget has no objectMetadataId',
          ),
          ChartDataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(flatObjectMetadata)) {
        throw new ChartDataException(
          generateChartDataExceptionMessage(
            ChartDataExceptionCode.OBJECT_METADATA_NOT_FOUND,
            objectMetadataId,
          ),
          ChartDataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      const primaryAxisGroupByField = getFieldMetadata(
        configuration.primaryAxisGroupByFieldMetadataId,
        flatFieldMetadataMaps,
      );

      const aggregateField = getFieldMetadata(
        configuration.aggregateFieldMetadataId,
        flatFieldMetadataMaps,
      );

      const isTwoDimensional = isDefined(
        configuration.secondaryAxisGroupByFieldMetadataId,
      );

      let secondaryAxisGroupByField: FlatFieldMetadata | undefined;

      if (isTwoDimensional) {
        secondaryAxisGroupByField = getFieldMetadata(
          configuration.secondaryAxisGroupByFieldMetadataId!,
          flatFieldMetadataMaps,
        );
      }

      const isStackedTwoDimensional =
        isTwoDimensional &&
        configuration.groupMode === BarChartGroupMode.STACKED;

      const limit = isStackedTwoDimensional
        ? BAR_CHART_MAXIMUM_NUMBER_OF_BARS *
            BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR +
          EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS
        : BAR_CHART_MAXIMUM_NUMBER_OF_BARS +
          EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS;

      const userTimezone = configuration.timezone ?? 'UTC';
      const firstDayOfTheWeek: CalendarStartDay =
        (configuration.firstDayOfTheWeek as CalendarStartDay | undefined) ??
        CalendarStartDay.MONDAY;

      const objectIdByNameSingular: Record<string, string> = {};

      for (const objMetadata of Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      )) {
        if (isDefined(objMetadata)) {
          objectIdByNameSingular[objMetadata.nameSingular] = objMetadata.id;
        }
      }

      const rawResults = await this.chartDataQueryService.executeGroupByQuery({
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
        authContext,
        groupByFieldMetadataId: configuration.primaryAxisGroupByFieldMetadataId,
        groupBySubFieldName: configuration.primaryAxisGroupBySubFieldName,
        aggregateFieldMetadataId: configuration.aggregateFieldMetadataId,
        aggregateOperation: configuration.aggregateOperation,
        filter: configuration.filter,
        dateGranularity: configuration.primaryAxisDateGranularity,
        userTimezone,
        firstDayOfTheWeek,
        limit,
        primaryAxisOrderBy: configuration.primaryAxisOrderBy,
        secondaryGroupByFieldMetadataId:
          configuration.secondaryAxisGroupByFieldMetadataId,
        secondaryGroupBySubFieldName:
          configuration.secondaryAxisGroupBySubFieldName,
        secondaryDateGranularity:
          configuration.secondaryAxisGroupByDateGranularity,
        secondaryAxisOrderBy: configuration.secondaryAxisOrderBy,
        splitMultiValueFields: configuration.splitMultiValueFields,
      });

      if (isTwoDimensional && isDefined(secondaryAxisGroupByField)) {
        return this.transformToTwoDimensionalBarChartData({
          rawResults,
          primaryAxisGroupByField,
          secondaryAxisGroupByField,
          aggregateField,
          configuration,
          userTimezone,
          firstDayOfTheWeek,
        });
      }

      return this.transformToOneDimensionalBarChartData({
        rawResults,
        primaryAxisGroupByField,
        aggregateField,
        configuration,
        userTimezone,
        firstDayOfTheWeek,
      });
    } catch (error) {
      if (error instanceof ChartDataException) {
        throw error;
      }

      throw new ChartDataException(
        generateChartDataExceptionMessage(
          ChartDataExceptionCode.QUERY_EXECUTION_FAILED,
          `Bar chart data retrieval failed: ${error instanceof Error ? error.message : String(error)}`,
        ),
        ChartDataExceptionCode.QUERY_EXECUTION_FAILED,
      );
    }
  }

  private transformToOneDimensionalBarChartData({
    rawResults,
    primaryAxisGroupByField,
    aggregateField,
    configuration,
    userTimezone,
    firstDayOfTheWeek,
  }: {
    rawResults: GroupByRawResult[];
    primaryAxisGroupByField: FlatFieldMetadata;
    aggregateField: FlatFieldMetadata;
    configuration: BarChartConfigurationDTO;
    userTimezone: string;
    firstDayOfTheWeek: CalendarStartDay;
  }): BarChartDataOutputDTO {
    const layout = configuration.layout ?? BarChartLayout.VERTICAL;
    const isHorizontal = layout === BarChartLayout.HORIZONTAL;

    const filteredResults = configuration.omitNullValues
      ? rawResults.filter(
          (result) =>
            isDefined(result.groupByDimensionValues?.[0]) &&
            result.aggregateValue !== 0,
        )
      : rawResults;

    const rangeFilteredResults =
      isDefined(configuration.rangeMin) || isDefined(configuration.rangeMax)
        ? filterByRange(
            filteredResults,
            configuration.rangeMin,
            configuration.rangeMax,
          )
        : filteredResults;

    const isDescOrder =
      configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_DESC;

    const { data: gapFilledResults, wasTruncated: dateRangeWasTruncated } =
      applyGapFilling({
        data: rangeFilteredResults,
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

    const indexByKey = configuration.primaryAxisGroupBySubFieldName
      ? `${primaryAxisGroupByField.name}${this.capitalizeFirst(configuration.primaryAxisGroupBySubFieldName)}`
      : primaryAxisGroupByField.name;

    const aggregateValueKey =
      indexByKey === aggregateField.name
        ? `${aggregateField.name}-aggregate`
        : aggregateField.name;

    const { processedDataPoints, formattedToRawLookup } =
      processOneDimensionalResults({
        rawResults: gapFilledResults,
        primaryAxisGroupByField,
        dateGranularity: configuration.primaryAxisDateGranularity,
        subFieldName: configuration.primaryAxisGroupBySubFieldName,
        userTimezone,
        firstDayOfTheWeek: convertedFirstDayOfTheWeek,
      });

    const sortedData = sortChartDataIfNeeded({
      data: processedDataPoints,
      orderBy: configuration.primaryAxisOrderBy,
      manualSortOrder: configuration.primaryAxisManualSortOrder,
      formattedToRawLookup,
      getFieldValue: (item) => item.formattedValue,
      getNumericValue: (item) => item.aggregateValue,
      selectFieldOptions: selectOptions,
      fieldType: primaryAxisGroupByField.type,
      subFieldName: configuration.primaryAxisGroupBySubFieldName ?? undefined,
      dateGranularity: configuration.primaryAxisDateGranularity,
    });

    const limitedSortedData = sortedData.slice(
      0,
      BAR_CHART_MAXIMUM_NUMBER_OF_BARS,
    );

    const transformedData = configuration.isCumulative
      ? this.applyCumulativeTransformInternal(limitedSortedData)
      : limitedSortedData;

    const data = transformedData.map((item) => ({
      [indexByKey]: item.formattedValue,
      [aggregateValueKey]: item.aggregateValue,
    }));

    const series = [
      {
        key: aggregateValueKey,
        label: aggregateField.label,
      },
    ];

    const categoryLabel = primaryAxisGroupByField.label;
    const valueLabel = `${getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`;

    const xAxisLabel = isHorizontal ? valueLabel : categoryLabel;
    const yAxisLabel = isHorizontal ? categoryLabel : valueLabel;

    return {
      data,
      indexBy: indexByKey,
      keys: [aggregateValueKey],
      series,
      xAxisLabel,
      yAxisLabel,
      showLegend: configuration.displayLegend ?? true,
      showDataLabels: configuration.displayDataLabel ?? false,
      layout,
      groupMode: configuration.groupMode ?? BarChartGroupMode.GROUPED,
      hasTooManyGroups:
        filteredResults.length > BAR_CHART_MAXIMUM_NUMBER_OF_BARS ||
        dateRangeWasTruncated,
      formattedToRawLookup: Object.fromEntries(formattedToRawLookup),
    };
  }

  private transformToTwoDimensionalBarChartData({
    rawResults,
    primaryAxisGroupByField,
    secondaryAxisGroupByField,
    aggregateField,
    configuration,
    userTimezone,
    firstDayOfTheWeek,
  }: {
    rawResults: GroupByRawResult[];
    primaryAxisGroupByField: FlatFieldMetadata;
    secondaryAxisGroupByField: FlatFieldMetadata;
    aggregateField: FlatFieldMetadata;
    configuration: BarChartConfigurationDTO;
    userTimezone: string;
    firstDayOfTheWeek: CalendarStartDay;
  }): BarChartDataOutputDTO {
    const layout = configuration.layout ?? BarChartLayout.VERTICAL;
    const isHorizontal = layout === BarChartLayout.HORIZONTAL;

    const filteredResults = configuration.omitNullValues
      ? rawResults.filter(
          (result) =>
            isDefined(result.groupByDimensionValues?.[0]) &&
            result.aggregateValue !== 0,
        )
      : rawResults;

    const effectiveGroupMode =
      configuration.groupMode ?? BarChartGroupMode.STACKED;
    const isStacked = effectiveGroupMode === BarChartGroupMode.STACKED;

    const rangeFilteredResults =
      !isStacked &&
      (isDefined(configuration.rangeMin) || isDefined(configuration.rangeMax))
        ? filterByRange(
            filteredResults,
            configuration.rangeMin,
            configuration.rangeMax,
          )
        : filteredResults;

    const isDescOrder =
      configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_DESC;

    const { data: gapFilledResults, wasTruncated: dateRangeWasTruncated } =
      applyGapFilling({
        data: rangeFilteredResults,
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
      ? `${primaryAxisGroupByField.name}${this.capitalizeFirst(configuration.primaryAxisGroupBySubFieldName)}`
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
      secondaryDateGranularity:
        configuration.secondaryAxisGroupByDateGranularity,
      secondarySubFieldName: configuration.secondaryAxisGroupBySubFieldName,
      userTimezone,
      firstDayOfTheWeek: convertedFirstDayOfTheWeek,
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

    const sortedKeys = this.sortSecondaryAxisKeys({
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
      const hasTooManySegments =
        totalSegments > BAR_CHART_MAXIMUM_NUMBER_OF_BARS;

      if (hasTooManySegments) {
        const maxXValues = Math.floor(
          BAR_CHART_MAXIMUM_NUMBER_OF_BARS / limitedKeys.length,
        );

        finalLimitedData = finalLimitedData.slice(0, Math.max(1, maxXValues));
      }
    }

    if (
      isStacked &&
      (isDefined(configuration.rangeMin) || isDefined(configuration.rangeMax))
    ) {
      finalLimitedData = filterTwoDimensionalDataByRange(
        finalLimitedData,
        limitedKeys,
        configuration.rangeMin,
        configuration.rangeMax,
      );
    }

    const finalData = configuration.isCumulative
      ? this.applyCumulativeTwoDimensional(finalLimitedData, limitedKeys)
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
      const hasTooManySegments =
        totalSegments > BAR_CHART_MAXIMUM_NUMBER_OF_BARS;

      hasTooManyGroups = hasTooManyGroups || hasTooManySegments;
    }

    hasTooManyGroups = hasTooManyGroups || dateRangeWasTruncated;

    const mergedLookup = new Map([
      ...formattedToRawLookup,
      ...secondaryFormattedToRawLookup,
    ]);

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
      formattedToRawLookup: Object.fromEntries(mergedLookup),
    };
  }

  private sortSecondaryAxisKeys({
    keys,
    data,
    configuration,
    secondaryFormattedToRawLookup,
    secondarySelectOptions,
    secondaryAxisGroupByField,
  }: {
    keys: string[];
    data: Record<string, string | number>[];
    configuration: BarChartConfigurationDTO;
    secondaryFormattedToRawLookup: Map<string, RawDimensionValue>;
    secondarySelectOptions: FieldMetadataOption[] | null;
    secondaryAxisGroupByField: FlatFieldMetadata;
  }): string[] {
    const orderBy = configuration.secondaryAxisOrderBy;

    if (!isDefined(orderBy)) {
      return keys;
    }

    return sortSecondaryAxisData({
      items: keys,
      orderBy,
      manualSortOrder: configuration.secondaryAxisManualSortOrder,
      formattedToRawLookup: secondaryFormattedToRawLookup,
      getFormattedValue: (key) => key,
      getNumericValue: (key) => {
        let sum = 0;

        for (const datum of data) {
          const value = datum[key];

          if (isNumber(value)) {
            sum += value;
          }
        }

        return sum;
      },
      selectFieldOptions: secondarySelectOptions,
      fieldType: secondaryAxisGroupByField.type,
      subFieldName: configuration.secondaryAxisGroupBySubFieldName ?? undefined,
      dateGranularity: configuration.secondaryAxisGroupByDateGranularity,
    });
  }

  private applyCumulativeTwoDimensional(
    data: Record<string, string | number>[],
    keys: string[],
  ): Record<string, string | number>[] {
    const runningTotals: Record<string, number> = {};

    for (const key of keys) {
      runningTotals[key] = 0;
    }

    const result: Record<string, string | number>[] = [];

    for (const datum of data) {
      const newDatum = { ...datum };

      for (const key of keys) {
        const value = datum[key];

        if (isNumber(value)) {
          runningTotals[key] += value;
        }

        newDatum[key] = runningTotals[key];
      }

      result.push(newDatum);
    }

    return result;
  }

  private applyCumulativeTransformInternal(
    data: Array<{
      formattedValue: string;
      aggregateValue: number;
      rawValue: RawDimensionValue;
    }>,
  ): Array<{
    formattedValue: string;
    aggregateValue: number;
    rawValue: RawDimensionValue;
  }> {
    const result: Array<{
      formattedValue: string;
      aggregateValue: number;
      rawValue: RawDimensionValue;
    }> = [];
    let runningTotal = 0;

    for (const point of data) {
      runningTotal += point.aggregateValue;

      const cumulativeValue = runningTotal;

      result.push({ ...point, aggregateValue: cumulativeValue });
    }

    return result;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
