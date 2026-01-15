import { Injectable } from '@nestjs/common';

import { CalendarStartDay } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import {
  BAR_CHART_MAXIMUM_NUMBER_OF_BARS,
  BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR,
  EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
} from 'src/modules/dashboard/chart-data/constants/bar-chart.constants';
import { BarChartDataOutputDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/bar-chart-data-output.dto';
import { BarChartSeriesDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/bar-chart-series.dto';
import {
  ChartDataException,
  ChartDataExceptionCode,
  ChartDataExceptionMessageKey,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import {
  ChartDataQueryService,
  type GroupByRawResult,
} from 'src/modules/dashboard/chart-data/services/chart-data-query.service';
import { FieldMetadataOption } from 'src/modules/dashboard/chart-data/types/field-metadata-option.type';
import { RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { filterByRange } from 'src/modules/dashboard/chart-data/utils/filter-by-range.util';
import { formatDimensionValue } from 'src/modules/dashboard/chart-data/utils/format-dimension-value.util';
import { getAggregateOperationLabel } from 'src/modules/dashboard/chart-data/utils/get-aggregate-operation-label.util';
import { getFieldMetadata } from 'src/modules/dashboard/chart-data/utils/get-field-metadata.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data.util';

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
          ChartDataExceptionMessageKey.OBJECT_METADATA_NOT_FOUND,
          'Widget has no objectMetadataId',
        ),
        ChartDataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const flatObjectMetadata = flatObjectMetadataMaps.byId[objectMetadataId];

    if (!isDefined(flatObjectMetadata)) {
      throw new ChartDataException(
        generateChartDataExceptionMessage(
          ChartDataExceptionMessageKey.OBJECT_METADATA_NOT_FOUND,
          objectMetadataId,
        ),
        ChartDataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const primaryAxisGroupByField = getFieldMetadata(
      configuration.primaryAxisGroupByFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const aggregateField = getFieldMetadata(
      configuration.aggregateFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const isTwoDimensional = isDefined(
      configuration.secondaryAxisGroupByFieldMetadataId,
    );

    let secondaryAxisGroupByField: FlatFieldMetadata | undefined;

    if (isTwoDimensional) {
      secondaryAxisGroupByField = getFieldMetadata(
        configuration.secondaryAxisGroupByFieldMetadataId!,
        flatFieldMetadataMaps.byId,
      );
    }

    const isStackedTwoDimensional =
      isTwoDimensional && configuration.groupMode === BarChartGroupMode.STACKED;

    const limit = isStackedTwoDimensional
      ? BAR_CHART_MAXIMUM_NUMBER_OF_BARS *
          BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS
      : BAR_CHART_MAXIMUM_NUMBER_OF_BARS + EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS;

    const userTimezone = configuration.timezone ?? 'UTC';
    const firstDayOfTheWeek: CalendarStartDay =
      (configuration.firstDayOfTheWeek as CalendarStartDay | undefined) ??
      CalendarStartDay.MONDAY;

    const objectIdByNameSingular: Record<string, string> = {};

    for (const objectId in flatObjectMetadataMaps.byId) {
      const objMetadata = flatObjectMetadataMaps.byId[objectId];

      if (isDefined(objMetadata)) {
        objectIdByNameSingular[objMetadata.nameSingular] = objectId;
      }
    }

    const rawResults = await this.chartDataQueryService.executeGroupByQuery({
      workspaceId,
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
      secondaryGroupByFieldMetadataId:
        configuration.secondaryAxisGroupByFieldMetadataId,
      secondaryGroupBySubFieldName:
        configuration.secondaryAxisGroupBySubFieldName,
      secondaryDateGranularity:
        configuration.secondaryAxisGroupByDateGranularity,
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

    return this.transformToBarChartData({
      rawResults,
      primaryAxisGroupByField,
      aggregateField,
      configuration,
      userTimezone,
      firstDayOfTheWeek,
    });
  }

  private transformToBarChartData({
    rawResults,
    primaryAxisGroupByField,
    aggregateField,
    configuration,
    userTimezone: _userTimezone,
    firstDayOfTheWeek: _firstDayOfTheWeek,
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
      ? rawResults.filter((result) =>
          isDefined(result.groupByDimensionValues?.[0]),
        )
      : rawResults;

    const rangeFilteredResults =
      !configuration.isCumulative &&
      (isDefined(configuration.rangeMin) || isDefined(configuration.rangeMax))
        ? filterByRange(
            filteredResults,
            configuration.rangeMin,
            configuration.rangeMax,
          )
        : filteredResults;

    const formattedToRawLookup = new Map<string, RawDimensionValue>();
    const selectOptions = getSelectOptions(primaryAxisGroupByField);

    const indexByKey = configuration.primaryAxisGroupBySubFieldName
      ? `${primaryAxisGroupByField.name}${this.capitalizeFirst(configuration.primaryAxisGroupBySubFieldName)}`
      : primaryAxisGroupByField.name;

    const aggregateValueKey =
      indexByKey === aggregateField.name
        ? `${aggregateField.name}-aggregate`
        : aggregateField.name;

    type InternalBarDatum = {
      formattedValue: string;
      aggregateValue: number;
      rawValue: RawDimensionValue;
    };

    const processedDataPoints: InternalBarDatum[] = rangeFilteredResults.map(
      (result) => {
        const rawValue = result
          .groupByDimensionValues?.[0] as RawDimensionValue;
        const formattedValue = formatDimensionValue(
          rawValue,
          primaryAxisGroupByField,
          selectOptions,
        );

        if (isDefined(rawValue)) {
          formattedToRawLookup.set(formattedValue, rawValue);
        }

        return {
          formattedValue,
          aggregateValue: result.aggregateValue,
          rawValue,
        };
      },
    );

    const sortedData = sortChartDataIfNeeded({
      data: processedDataPoints,
      orderBy: configuration.primaryAxisOrderBy,
      manualSortOrder: configuration.primaryAxisManualSortOrder,
      formattedToRawLookup,
      getFieldValue: (item) => item.formattedValue,
      getNumericValue: (item) => item.aggregateValue,
      selectFieldOptions: selectOptions,
    });

    const limitedSortedData = sortedData.slice(
      0,
      BAR_CHART_MAXIMUM_NUMBER_OF_BARS,
    );

    const transformedData = configuration.isCumulative
      ? this.applyCumulativeTransformInternal(
          limitedSortedData,
          configuration.rangeMin,
          configuration.rangeMax,
        )
      : limitedSortedData;

    const data: Record<string, string | number>[] = transformedData.map(
      (item) => {
        const datum: Record<string, string | number> = {
          [indexByKey]: item.formattedValue,
          [aggregateValueKey]: item.aggregateValue,
        };

        return datum;
      },
    );

    const series: BarChartSeriesDTO[] = [
      {
        key: aggregateValueKey,
        label: aggregateField.label,
      },
    ];

    const showCategoryLabel = isHorizontal
      ? configuration.axisNameDisplay === AxisNameDisplay.Y ||
        configuration.axisNameDisplay === AxisNameDisplay.BOTH
      : configuration.axisNameDisplay === AxisNameDisplay.X ||
        configuration.axisNameDisplay === AxisNameDisplay.BOTH;

    const showValueLabel = isHorizontal
      ? configuration.axisNameDisplay === AxisNameDisplay.X ||
        configuration.axisNameDisplay === AxisNameDisplay.BOTH
      : configuration.axisNameDisplay === AxisNameDisplay.Y ||
        configuration.axisNameDisplay === AxisNameDisplay.BOTH;

    const xAxisLabel = showCategoryLabel
      ? primaryAxisGroupByField.label
      : undefined;
    const yAxisLabel = showValueLabel
      ? `${getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`
      : undefined;

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
        filteredResults.length > BAR_CHART_MAXIMUM_NUMBER_OF_BARS,
      formattedToRawLookup: Object.fromEntries(formattedToRawLookup),
    };
  }

  private transformToTwoDimensionalBarChartData({
    rawResults,
    primaryAxisGroupByField,
    secondaryAxisGroupByField,
    aggregateField,
    configuration,
    userTimezone: _userTimezone,
    firstDayOfTheWeek: _firstDayOfTheWeek,
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
      ? rawResults.filter((result) =>
          isDefined(result.groupByDimensionValues?.[0]),
        )
      : rawResults;

    const formattedToRawLookup = new Map<string, RawDimensionValue>();
    const secondaryFormattedToRawLookup = new Map<string, RawDimensionValue>();

    const primarySelectOptions = getSelectOptions(primaryAxisGroupByField);
    const secondarySelectOptions = getSelectOptions(secondaryAxisGroupByField);

    const indexByKey = configuration.primaryAxisGroupBySubFieldName
      ? `${primaryAxisGroupByField.name}${this.capitalizeFirst(configuration.primaryAxisGroupBySubFieldName)}`
      : primaryAxisGroupByField.name;

    type ProcessedTwoDimDataPoint = {
      xFormatted: string;
      yFormatted: string;
      rawXValue: RawDimensionValue;
      rawYValue: RawDimensionValue;
      aggregateValue: number;
    };

    const processedDataPoints: ProcessedTwoDimDataPoint[] = [];
    const allSecondaryValues = new Set<string>();

    for (const result of filteredResults) {
      const dimensionValues = result.groupByDimensionValues;

      if (!isDefined(dimensionValues) || dimensionValues.length < 2) {
        continue;
      }

      const rawXValue = dimensionValues[0] as RawDimensionValue;
      const rawYValue = dimensionValues[1] as RawDimensionValue;

      const xFormatted = formatDimensionValue(
        rawXValue,
        primaryAxisGroupByField,
        primarySelectOptions,
      );
      const yFormatted = formatDimensionValue(
        rawYValue,
        secondaryAxisGroupByField,
        secondarySelectOptions,
      );

      if (isDefined(rawXValue)) {
        formattedToRawLookup.set(xFormatted, rawXValue);
      }
      if (isDefined(rawYValue)) {
        secondaryFormattedToRawLookup.set(yFormatted, rawYValue);
      }

      allSecondaryValues.add(yFormatted);

      processedDataPoints.push({
        xFormatted,
        yFormatted,
        rawXValue,
        rawYValue,
        aggregateValue: result.aggregateValue,
      });
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

          if (typeof value === 'number') {
            sum += value;
          }
        }

        return sum;
      },
      selectFieldOptions: primarySelectOptions,
    });

    const limitedData = sortedData.slice(0, BAR_CHART_MAXIMUM_NUMBER_OF_BARS);

    const keys = Array.from(allSecondaryValues);

    const sortedKeys = this.sortSecondaryAxisKeys({
      keys,
      data: limitedData,
      configuration,
      secondaryFormattedToRawLookup,
      secondarySelectOptions,
    });

    const isStacked = configuration.groupMode === BarChartGroupMode.STACKED;
    const maxKeys = isStacked
      ? BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR
      : BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR;
    const limitedKeys = sortedKeys.slice(0, maxKeys);

    const finalData = configuration.isCumulative
      ? this.applyCumulativeTwoDimensional(
          limitedData,
          limitedKeys,
          configuration.rangeMin,
          configuration.rangeMax,
        )
      : limitedData;

    const series: BarChartSeriesDTO[] = limitedKeys.map((key) => {
      return {
        key,
        label: key,
      };
    });

    const showCategoryLabel = isHorizontal
      ? configuration.axisNameDisplay === AxisNameDisplay.Y ||
        configuration.axisNameDisplay === AxisNameDisplay.BOTH
      : configuration.axisNameDisplay === AxisNameDisplay.X ||
        configuration.axisNameDisplay === AxisNameDisplay.BOTH;

    const showValueLabel = isHorizontal
      ? configuration.axisNameDisplay === AxisNameDisplay.X ||
        configuration.axisNameDisplay === AxisNameDisplay.BOTH
      : configuration.axisNameDisplay === AxisNameDisplay.Y ||
        configuration.axisNameDisplay === AxisNameDisplay.BOTH;

    const xAxisLabel = showCategoryLabel
      ? primaryAxisGroupByField.label
      : undefined;
    const yAxisLabel = showValueLabel
      ? `${getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`
      : undefined;

    const hasTooManyGroups =
      sortedData.length > BAR_CHART_MAXIMUM_NUMBER_OF_BARS ||
      keys.length > maxKeys;

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
      formattedToRawLookup: Object.fromEntries(formattedToRawLookup),
    };
  }

  private sortSecondaryAxisKeys({
    keys,
    data,
    configuration,
    secondaryFormattedToRawLookup,
    secondarySelectOptions,
  }: {
    keys: string[];
    data: Record<string, string | number>[];
    configuration: BarChartConfigurationDTO;
    secondaryFormattedToRawLookup: Map<string, RawDimensionValue>;
    secondarySelectOptions: FieldMetadataOption[] | null;
  }): string[] {
    const orderBy = configuration.secondaryAxisOrderBy;

    if (!isDefined(orderBy)) {
      return keys;
    }

    return sortChartDataIfNeeded({
      data: keys,
      orderBy,
      manualSortOrder: configuration.secondaryAxisManualSortOrder,
      formattedToRawLookup: secondaryFormattedToRawLookup,
      getFieldValue: (key) => key,
      getNumericValue: (key) => {
        let sum = 0;

        for (const datum of data) {
          const value = datum[key];

          if (typeof value === 'number') {
            sum += value;
          }
        }

        return sum;
      },
      selectFieldOptions: secondarySelectOptions,
    });
  }

  private applyCumulativeTwoDimensional(
    data: Record<string, string | number>[],
    keys: string[],
    rangeMin?: number | null,
    rangeMax?: number | null,
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

        if (typeof value === 'number') {
          runningTotals[key] += value;
        }

        newDatum[key] = runningTotals[key];
      }

      const totalValue = keys.reduce((sum, key) => {
        const value = newDatum[key];

        return sum + (typeof value === 'number' ? value : 0);
      }, 0);

      const isOutOfRange =
        (isDefined(rangeMin) && totalValue < rangeMin) ||
        (isDefined(rangeMax) && totalValue > rangeMax);

      if (!isOutOfRange) {
        result.push(newDatum);
      }
    }

    return result;
  }

  private applyCumulativeTransformInternal(
    data: Array<{
      formattedValue: string;
      aggregateValue: number;
      rawValue: RawDimensionValue;
    }>,
    rangeMin?: number | null,
    rangeMax?: number | null,
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

      const isOutOfRange =
        (isDefined(rangeMin) && cumulativeValue < rangeMin) ||
        (isDefined(rangeMax) && cumulativeValue > rangeMax);

      if (!isOutOfRange) {
        result.push({ ...point, aggregateValue: cumulativeValue });
      }
    }

    return result;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
