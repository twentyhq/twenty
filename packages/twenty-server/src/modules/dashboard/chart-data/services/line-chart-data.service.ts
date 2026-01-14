import { Injectable } from '@nestjs/common';

import { FieldMetadataType, FirstDayOfTheWeek } from 'twenty-shared/types';
import { isDefined, isFieldMetadataSelectKind } from 'twenty-shared/utils';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import {
  EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
  LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS,
  LINE_CHART_MAXIMUM_NUMBER_OF_SERIES,
} from 'src/modules/dashboard/chart-data/constants/line-chart.constants';
import { LineChartDataOutputDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/line-chart-data-output.dto';
import { LineChartDataPointDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/line-chart-data-point.dto';
import { LineChartSeriesDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/line-chart-series.dto';
import {
  ChartDataException,
  ChartDataExceptionCode,
  ChartDataExceptionMessageKey,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import {
  ChartDataQueryService,
  GroupByRawResult,
} from 'src/modules/dashboard/chart-data/services/chart-data-query.service';
import { RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data.util';

type GetLineChartDataParams = {
  workspaceId: string;
  objectMetadataId: string;
  configuration: LineChartConfigurationDTO;
};

type FieldMetadataOption = {
  value: string;
  label: string;
  color?: string;
  position: number;
};

@Injectable()
export class LineChartDataService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly chartDataQueryService: ChartDataQueryService,
  ) {}

  async getLineChartData({
    workspaceId,
    objectMetadataId,
    configuration,
  }: GetLineChartDataParams): Promise<LineChartDataOutputDTO> {
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

    const primaryAxisGroupByField = this.getFieldMetadata(
      configuration.primaryAxisGroupByFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const aggregateField = this.getFieldMetadata(
      configuration.aggregateFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const isTwoDimensional = isDefined(
      configuration.secondaryAxisGroupByFieldMetadataId,
    );

    let secondaryAxisGroupByField: FlatFieldMetadata | undefined;

    if (isTwoDimensional) {
      secondaryAxisGroupByField = this.getFieldMetadata(
        configuration.secondaryAxisGroupByFieldMetadataId!,
        flatFieldMetadataMaps.byId,
      );
    }

    const isStackedTwoDimensional =
      isTwoDimensional && configuration.isStacked === true;

    const limit = isStackedTwoDimensional
      ? LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS *
          LINE_CHART_MAXIMUM_NUMBER_OF_SERIES +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS
      : LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS;

    const userTimezone = configuration.timezone ?? 'UTC';
    const firstDayOfTheWeek: FirstDayOfTheWeek =
      (configuration.firstDayOfTheWeek as FirstDayOfTheWeek | undefined) ??
      FirstDayOfTheWeek.MONDAY;

    const rawResults = await this.chartDataQueryService.executeGroupByQuery({
      workspaceId,
      flatObjectMetadata,
      flatFieldMetadataMaps,
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
      return this.transformToTwoDimensionalLineChartData({
        rawResults,
        primaryAxisGroupByField,
        secondaryAxisGroupByField,
        aggregateField,
        configuration,
        userTimezone,
        firstDayOfTheWeek,
      });
    }

    return this.transformToLineChartData({
      rawResults,
      primaryAxisGroupByField,
      aggregateField,
      configuration,
      userTimezone,
      firstDayOfTheWeek,
    });
  }

  private getFieldMetadata(
    fieldMetadataId: string,
    fieldMetadataById: Partial<Record<string, FlatFieldMetadata>>,
  ): FlatFieldMetadata {
    const fieldMetadata = fieldMetadataById[fieldMetadataId];

    if (!isDefined(fieldMetadata)) {
      throw new ChartDataException(
        generateChartDataExceptionMessage(
          ChartDataExceptionMessageKey.FIELD_METADATA_NOT_FOUND,
          fieldMetadataId,
        ),
        ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    return fieldMetadata;
  }

  private transformToLineChartData({
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
    configuration: LineChartConfigurationDTO;
    userTimezone: string;
    firstDayOfTheWeek: FirstDayOfTheWeek;
  }): LineChartDataOutputDTO {
    const filteredResults = configuration.omitNullValues
      ? rawResults.filter((result) =>
          isDefined(result.groupByDimensionValues?.[0]),
        )
      : rawResults;

    const rangeFilteredResults =
      !configuration.isCumulative &&
      (isDefined(configuration.rangeMin) || isDefined(configuration.rangeMax))
        ? this.filterByRange(
            filteredResults,
            configuration.rangeMin,
            configuration.rangeMax,
          )
        : filteredResults;

    const formattedToRawLookup = new Map<string, RawDimensionValue>();
    const selectOptions = this.getSelectOptions(primaryAxisGroupByField);

    const processedDataPoints = rangeFilteredResults.map((result) => {
      const rawValue = result.groupByDimensionValues?.[0] as RawDimensionValue;
      const formattedValue = this.formatDimensionValue(
        rawValue,
        primaryAxisGroupByField,
        selectOptions,
      );

      if (isDefined(rawValue)) {
        formattedToRawLookup.set(formattedValue, rawValue);
      }

      return {
        x: formattedValue,
        y: result.aggregateValue,
        rawValue,
      };
    });

    const sortedData = sortChartDataIfNeeded({
      data: processedDataPoints,
      orderBy: configuration.primaryAxisOrderBy,
      manualSortOrder: configuration.primaryAxisManualSortOrder,
      formattedToRawLookup,
      getFieldValue: (item) => item.x,
      getNumericValue: (item) => item.y ?? 0,
      selectFieldOptions: selectOptions,
    });

    const limitedSortedData = sortedData.slice(
      0,
      LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS,
    );

    const transformedData = configuration.isCumulative
      ? this.applyCumulativeTransform(
          limitedSortedData,
          configuration.rangeMin,
          configuration.rangeMax,
        )
      : limitedSortedData;

    const dataPoints: LineChartDataPointDTO[] = transformedData.map(
      ({ x, y }) => ({
        x,
        y,
      }),
    );

    const series: LineChartSeriesDTO[] = [
      {
        id: aggregateField.name,
        label: aggregateField.label,
        data: dataPoints,
      },
    ];

    const showXAxis =
      configuration.axisNameDisplay === AxisNameDisplay.X ||
      configuration.axisNameDisplay === AxisNameDisplay.BOTH;

    const showYAxis =
      configuration.axisNameDisplay === AxisNameDisplay.Y ||
      configuration.axisNameDisplay === AxisNameDisplay.BOTH;

    const xAxisLabel = showXAxis ? primaryAxisGroupByField.label : undefined;
    const yAxisLabel = showYAxis
      ? `${this.getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`
      : undefined;

    return {
      series,
      xAxisLabel,
      yAxisLabel,
      showLegend: configuration.displayLegend ?? true,
      showDataLabels: configuration.displayDataLabel ?? false,
      hasTooManyGroups:
        filteredResults.length > LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS,
      formattedToRawLookup: Object.fromEntries(formattedToRawLookup),
    };
  }

  private transformToTwoDimensionalLineChartData({
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
    configuration: LineChartConfigurationDTO;
    userTimezone: string;
    firstDayOfTheWeek: FirstDayOfTheWeek;
  }): LineChartDataOutputDTO {
    const filteredResults = configuration.omitNullValues
      ? rawResults.filter((result) =>
          isDefined(result.groupByDimensionValues?.[0]),
        )
      : rawResults;

    const formattedToRawLookup = new Map<string, RawDimensionValue>();
    const secondaryFormattedToRawLookup = new Map<string, RawDimensionValue>();

    const primarySelectOptions = this.getSelectOptions(primaryAxisGroupByField);
    const secondarySelectOptions = this.getSelectOptions(
      secondaryAxisGroupByField,
    );

    type ProcessedTwoDimDataPoint = {
      xFormatted: string;
      ySeriesId: string;
      rawXValue: RawDimensionValue;
      rawYValue: RawDimensionValue;
      aggregateValue: number;
    };

    const processedDataPoints: ProcessedTwoDimDataPoint[] = [];
    const allXValues: string[] = [];
    const xValueSet = new Set<string>();
    const allSeriesIds = new Set<string>();

    for (const result of filteredResults) {
      const dimensionValues = result.groupByDimensionValues;

      if (!isDefined(dimensionValues) || dimensionValues.length < 2) {
        continue;
      }

      const rawXValue = dimensionValues[0] as RawDimensionValue;
      const rawYValue = dimensionValues[1] as RawDimensionValue;

      const xFormatted = this.formatDimensionValue(
        rawXValue,
        primaryAxisGroupByField,
        primarySelectOptions,
      );
      const ySeriesId = this.formatDimensionValue(
        rawYValue,
        secondaryAxisGroupByField,
        secondarySelectOptions,
      );

      if (isDefined(rawXValue)) {
        formattedToRawLookup.set(xFormatted, rawXValue);
      }

      if (isDefined(rawYValue)) {
        secondaryFormattedToRawLookup.set(ySeriesId, rawYValue);
      }

      if (!xValueSet.has(xFormatted)) {
        xValueSet.add(xFormatted);
        allXValues.push(xFormatted);
      }

      allSeriesIds.add(ySeriesId);

      processedDataPoints.push({
        xFormatted,
        ySeriesId,
        rawXValue,
        rawYValue,
        aggregateValue: result.aggregateValue,
      });
    }

    const seriesMap = new Map<string, Map<string, number>>();

    for (const point of processedDataPoints) {
      if (!seriesMap.has(point.ySeriesId)) {
        seriesMap.set(point.ySeriesId, new Map());
      }

      seriesMap
        .get(point.ySeriesId)!
        .set(point.xFormatted, point.aggregateValue);
    }

    const sortedXValues = sortChartDataIfNeeded({
      data: allXValues,
      orderBy: configuration.primaryAxisOrderBy,
      manualSortOrder: configuration.primaryAxisManualSortOrder,
      formattedToRawLookup,
      getFieldValue: (x) => x,
      getNumericValue: (_x) => 0,
      selectFieldOptions: primarySelectOptions,
    });

    const limitedXValues = sortedXValues.slice(
      0,
      LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS,
    );

    const seriesIds = Array.from(allSeriesIds);

    const sortedSeriesIds = this.sortSecondaryAxisSeriesIds({
      seriesIds,
      seriesMap,
      configuration,
      secondaryFormattedToRawLookup,
      secondarySelectOptions,
    });

    const limitedSeriesIds = sortedSeriesIds.slice(
      0,
      LINE_CHART_MAXIMUM_NUMBER_OF_SERIES,
    );

    const series: LineChartSeriesDTO[] = limitedSeriesIds.map((seriesId) => {
      const xToYMap = seriesMap.get(seriesId) ?? new Map();

      let dataPoints: LineChartDataPointDTO[] = limitedXValues.map(
        (xValue) => ({
          x: xValue,
          y: xToYMap.get(xValue) ?? 0,
        }),
      );

      if (configuration.isCumulative) {
        dataPoints = this.applyCumulativeTransform(
          dataPoints,
          configuration.rangeMin,
          configuration.rangeMax,
        );
      }

      return {
        id: seriesId,
        label: seriesId,
        data: dataPoints,
      };
    });

    const showXAxis =
      configuration.axisNameDisplay === AxisNameDisplay.X ||
      configuration.axisNameDisplay === AxisNameDisplay.BOTH;

    const showYAxis =
      configuration.axisNameDisplay === AxisNameDisplay.Y ||
      configuration.axisNameDisplay === AxisNameDisplay.BOTH;

    const xAxisLabel = showXAxis ? primaryAxisGroupByField.label : undefined;
    const yAxisLabel = showYAxis
      ? `${this.getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`
      : undefined;

    const hasTooManyGroups =
      allXValues.length > LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS ||
      seriesIds.length > LINE_CHART_MAXIMUM_NUMBER_OF_SERIES;

    return {
      series,
      xAxisLabel,
      yAxisLabel,
      showLegend: configuration.displayLegend ?? true,
      showDataLabels: configuration.displayDataLabel ?? false,
      hasTooManyGroups,
      formattedToRawLookup: Object.fromEntries(formattedToRawLookup),
    };
  }

  private sortSecondaryAxisSeriesIds({
    seriesIds,
    seriesMap,
    configuration,
    secondaryFormattedToRawLookup,
    secondarySelectOptions,
  }: {
    seriesIds: string[];
    seriesMap: Map<string, Map<string, number>>;
    configuration: LineChartConfigurationDTO;
    secondaryFormattedToRawLookup: Map<string, RawDimensionValue>;
    secondarySelectOptions: FieldMetadataOption[] | null;
  }): string[] {
    const orderBy = configuration.secondaryAxisOrderBy;

    if (!isDefined(orderBy)) {
      return seriesIds;
    }

    return sortChartDataIfNeeded({
      data: seriesIds,
      orderBy,
      manualSortOrder: configuration.secondaryAxisManualSortOrder,
      formattedToRawLookup: secondaryFormattedToRawLookup,
      getFieldValue: (id) => id,
      getNumericValue: (id) => {
        const xToYMap = seriesMap.get(id);

        if (!xToYMap) {
          return 0;
        }

        let sum = 0;

        for (const value of xToYMap.values()) {
          sum += value;
        }

        return sum;
      },
      selectFieldOptions: secondarySelectOptions,
    });
  }

  private filterByRange(
    results: GroupByRawResult[],
    rangeMin?: number | null,
    rangeMax?: number | null,
  ): GroupByRawResult[] {
    return results.filter((result) => {
      const value = result.aggregateValue;

      if (isDefined(rangeMin) && value < rangeMin) {
        return false;
      }

      if (isDefined(rangeMax) && value > rangeMax) {
        return false;
      }

      return true;
    });
  }

  private applyCumulativeTransform<T extends { y: number | null }>(
    data: T[],
    rangeMin?: number | null,
    rangeMax?: number | null,
  ): T[] {
    const result: T[] = [];
    let runningTotal = 0;

    for (const point of data) {
      if (point.y !== null) {
        runningTotal += point.y;
      }

      const cumulativeValue = runningTotal;

      const isOutOfRange =
        (isDefined(rangeMin) && cumulativeValue < rangeMin) ||
        (isDefined(rangeMax) && cumulativeValue > rangeMax);

      if (!isOutOfRange) {
        result.push({ ...point, y: cumulativeValue });
      }
    }

    return result;
  }

  private getSelectOptions(
    fieldMetadata: FlatFieldMetadata,
  ): FieldMetadataOption[] | null {
    if (!isFieldMetadataSelectKind(fieldMetadata.type)) {
      return null;
    }

    const options = fieldMetadata.options as FieldMetadataOption[] | undefined;

    return options ?? null;
  }

  private formatDimensionValue(
    value: RawDimensionValue,
    fieldMetadata: FlatFieldMetadata,
    selectOptions: FieldMetadataOption[] | null,
  ): string {
    if (!isDefined(value)) {
      return 'Not Set';
    }

    if (
      fieldMetadata.type === FieldMetadataType.SELECT &&
      isDefined(selectOptions)
    ) {
      const selectedOption = selectOptions.find(
        (option) => option.value === value,
      );

      return selectedOption?.label ?? String(value);
    }

    if (fieldMetadata.type === FieldMetadataType.BOOLEAN) {
      return value === true ? 'Yes' : 'No';
    }

    return String(value);
  }

  private getAggregateOperationLabel(operation: AggregateOperations): string {
    switch (operation) {
      case AggregateOperations.MIN:
        return 'Min';
      case AggregateOperations.MAX:
        return 'Max';
      case AggregateOperations.AVG:
        return 'Average';
      case AggregateOperations.SUM:
        return 'Sum';
      case AggregateOperations.COUNT:
        return 'Count all';
      case AggregateOperations.COUNT_EMPTY:
        return 'Count empty';
      case AggregateOperations.COUNT_NOT_EMPTY:
        return 'Count not empty';
      case AggregateOperations.COUNT_UNIQUE_VALUES:
        return 'Count unique values';
      case AggregateOperations.PERCENTAGE_EMPTY:
        return 'Percent empty';
      case AggregateOperations.PERCENTAGE_NOT_EMPTY:
        return 'Percent not empty';
      case AggregateOperations.COUNT_TRUE:
        return 'Count true';
      case AggregateOperations.COUNT_FALSE:
        return 'Count false';
      default:
        return 'Count';
    }
  }
}
