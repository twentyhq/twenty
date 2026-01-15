import { Injectable } from '@nestjs/common';

import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  isDefined,
} from 'twenty-shared/utils';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
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
  type GroupByRawResult,
} from 'src/modules/dashboard/chart-data/services/chart-data-query.service';
import { FieldMetadataOption } from 'src/modules/dashboard/chart-data/types/field-metadata-option.type';
import { RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { applyGapFilling } from 'src/modules/dashboard/chart-data/utils/apply-gap-filling.util';
import { filterByRange } from 'src/modules/dashboard/chart-data/utils/filter-by-range.util';
import { formatDimensionValue } from 'src/modules/dashboard/chart-data/utils/format-dimension-value.util';
import { getAggregateOperationLabel } from 'src/modules/dashboard/chart-data/utils/get-aggregate-operation-label.util';
import { getFieldMetadata } from 'src/modules/dashboard/chart-data/utils/get-field-metadata.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data-if-needed.util';

type GetLineChartDataParams = {
  workspaceId: string;
  objectMetadataId: string;
  configuration: LineChartConfigurationDTO;
  authContext: AuthContext;
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
    authContext,
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
      isTwoDimensional && configuration.isStacked === true;

    const limit = isStackedTwoDimensional
      ? LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS *
          LINE_CHART_MAXIMUM_NUMBER_OF_SERIES +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS
      : LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS;

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

    const rawResults =
      await this.chartDataQueryService.executeGroupByQueryWithOrderBy({
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
        primaryAxisOrderBy: configuration.primaryAxisOrderBy,
        secondaryGroupByFieldMetadataId:
          configuration.secondaryAxisGroupByFieldMetadataId,
        secondaryGroupBySubFieldName:
          configuration.secondaryAxisGroupBySubFieldName,
        secondaryDateGranularity:
          configuration.secondaryAxisGroupByDateGranularity,
        secondaryAxisOrderBy: configuration.secondaryAxisOrderBy,
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

  private transformToLineChartData({
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
    configuration: LineChartConfigurationDTO;
    userTimezone: string;
    firstDayOfTheWeek: CalendarStartDay;
  }): LineChartDataOutputDTO {
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
      });

    const formattedToRawLookup = new Map<string, RawDimensionValue>();
    const selectOptions = getSelectOptions(primaryAxisGroupByField);

    const convertedFirstDayOfTheWeek =
      convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
        firstDayOfTheWeek,
        FirstDayOfTheWeek.SUNDAY,
      );

    const processedDataPoints = gapFilledResults.map((result) => {
      const rawValue = result.groupByDimensionValues?.[0] as RawDimensionValue;
      const formattedValue = formatDimensionValue({
        value: rawValue,
        fieldMetadata: primaryAxisGroupByField,
        dateGranularity: configuration.primaryAxisDateGranularity,
        subFieldName: configuration.primaryAxisGroupBySubFieldName,
        userTimezone: userTimezone,
        firstDayOfTheWeek: convertedFirstDayOfTheWeek,
      });

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
      ? `${getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`
      : undefined;

    return {
      series,
      xAxisLabel,
      yAxisLabel,
      showLegend: configuration.displayLegend ?? true,
      showDataLabels: configuration.displayDataLabel ?? false,
      hasTooManyGroups:
        filteredResults.length > LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS ||
        dateRangeWasTruncated,
      formattedToRawLookup: Object.fromEntries(formattedToRawLookup),
    };
  }

  private transformToTwoDimensionalLineChartData({
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
    configuration: LineChartConfigurationDTO;
    userTimezone: string;
    firstDayOfTheWeek: CalendarStartDay;
  }): LineChartDataOutputDTO {
    const filteredResults = configuration.omitNullValues
      ? rawResults.filter((result) =>
          isDefined(result.groupByDimensionValues?.[0]),
        )
      : rawResults;

    const isDescOrder =
      configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_DESC;

    const { data: gapFilledResults, wasTruncated: dateRangeWasTruncated } =
      applyGapFilling({
        data: filteredResults,
        primaryAxisGroupByField,
        dateGranularity: configuration.primaryAxisDateGranularity,
        omitNullValues: configuration.omitNullValues ?? false,
        isDescOrder,
        isTwoDimensional: true,
      });

    const formattedToRawLookup = new Map<string, RawDimensionValue>();
    const secondaryFormattedToRawLookup = new Map<string, RawDimensionValue>();

    const primarySelectOptions = getSelectOptions(primaryAxisGroupByField);
    const secondarySelectOptions = getSelectOptions(secondaryAxisGroupByField);

    const convertedFirstDayOfTheWeek =
      convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
        firstDayOfTheWeek,
        FirstDayOfTheWeek.SUNDAY,
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

    for (const result of gapFilledResults) {
      const dimensionValues = result.groupByDimensionValues;

      if (!isDefined(dimensionValues) || dimensionValues.length < 2) {
        continue;
      }

      const rawXValue = dimensionValues[0] as RawDimensionValue;
      const rawYValue = dimensionValues[1] as RawDimensionValue;

      const xFormatted = formatDimensionValue({
        value: rawXValue,
        fieldMetadata: primaryAxisGroupByField,
        dateGranularity: configuration.primaryAxisDateGranularity,
        subFieldName: configuration.primaryAxisGroupBySubFieldName,
        userTimezone: userTimezone,
        firstDayOfTheWeek: convertedFirstDayOfTheWeek,
      });
      const ySeriesId = formatDimensionValue({
        value: rawYValue,
        fieldMetadata: secondaryAxisGroupByField,
        dateGranularity: configuration.secondaryAxisGroupByDateGranularity,
        subFieldName: configuration.secondaryAxisGroupBySubFieldName,
        userTimezone: userTimezone,
        firstDayOfTheWeek: convertedFirstDayOfTheWeek,
      });

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
      ? `${getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`
      : undefined;

    const hasTooManyGroups =
      allXValues.length > LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS ||
      seriesIds.length > LINE_CHART_MAXIMUM_NUMBER_OF_SERIES ||
      dateRangeWasTruncated;

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
}
