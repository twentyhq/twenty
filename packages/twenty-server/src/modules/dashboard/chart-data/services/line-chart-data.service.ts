import { Injectable } from '@nestjs/common';

import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  isDefined,
} from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from 'src/modules/dashboard/chart-data/constants/extra-item-to-detect-too-many-groups.constant';
import { LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS } from 'src/modules/dashboard/chart-data/constants/line-chart-maximum-number-of-data-points.constant';
import { LINE_CHART_MAXIMUM_NUMBER_OF_NON_STACKED_SERIES } from 'src/modules/dashboard/chart-data/constants/line-chart-maximum-number-of-non-stacked-series.constant';
import { LINE_CHART_MAXIMUM_NUMBER_OF_STACKED_SERIES } from 'src/modules/dashboard/chart-data/constants/line-chart-maximum-number-of-stacked-series.constant';
import { LineChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/line-chart-data.dto';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';
import { ChartRelationLabelService } from 'src/modules/dashboard/chart-data/services/chart-relation-label.service';
import { FieldMetadataOption } from 'src/modules/dashboard/chart-data/types/field-metadata-option.type';
import { GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';
import { applyCumulativeToLineDataPoints } from 'src/modules/dashboard/chart-data/utils/apply-cumulative-to-line-data-points.util';
import { applyGapFilling } from 'src/modules/dashboard/chart-data/utils/apply-gap-filling.util';
import { buildFormattedToRawLookupDto } from 'src/modules/dashboard/chart-data/utils/build-formatted-to-raw-lookup-dto.util';
import { filterOutEmptyChartBuckets } from 'src/modules/dashboard/chart-data/utils/filter-out-empty-chart-buckets.util';
import { filterOutUnresolvedRelationBuckets } from 'src/modules/dashboard/chart-data/utils/filter-out-unresolved-relation-buckets.util';
import { getAggregateOperationLabel } from 'src/modules/dashboard/chart-data/utils/get-aggregate-operation-label.util';
import { getFieldMetadata } from 'src/modules/dashboard/chart-data/utils/get-field-metadata.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';
import { processOneDimensionalResults } from 'src/modules/dashboard/chart-data/utils/process-one-dimensional-results.util';
import { processTwoDimensionalResults } from 'src/modules/dashboard/chart-data/utils/process-two-dimensional-results.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data-if-needed.util';
import { sortSecondaryAxisData } from 'src/modules/dashboard/chart-data/utils/sort-secondary-axis-data.util';
import { buildLineChartSeriesIdPrefix } from 'src/modules/dashboard/chart-data/utils/build-line-chart-series-id-prefix.util';
import { wrapChartDataQueryError } from 'src/modules/dashboard/chart-data/utils/wrap-chart-data-query-error.util';

type GetLineChartDataParams = {
  workspaceId: string;
  objectMetadataId: string;
  configuration: LineChartConfigurationDTO;
  authContext: WorkspaceAuthContext;
};

@Injectable()
export class LineChartDataService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly chartDataQueryService: ChartDataQueryService,
    private readonly chartRelationLabelService: ChartRelationLabelService,
  ) {}

  async getLineChartData({
    workspaceId,
    objectMetadataId,
    configuration,
    authContext,
  }: GetLineChartDataParams): Promise<LineChartDataDTO> {
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
        isTwoDimensional && configuration.isStacked === true;

      const maxSeriesForQuery = isStackedTwoDimensional
        ? LINE_CHART_MAXIMUM_NUMBER_OF_STACKED_SERIES
        : LINE_CHART_MAXIMUM_NUMBER_OF_NON_STACKED_SERIES;

      const limit = isTwoDimensional
        ? LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS * maxSeriesForQuery +
          EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS
        : LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS +
          EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS;

      const userTimezone = configuration.timezone ?? 'UTC';
      const firstDayOfTheWeek: CalendarStartDay =
        (configuration.firstDayOfTheWeek as CalendarStartDay | undefined) ??
        CalendarStartDay.MONDAY;

      const { idByNameSingular: objectIdByNameSingular } =
        buildObjectIdByNameMaps(flatObjectMetadataMaps);

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

      const seriesIdPrefix = buildLineChartSeriesIdPrefix(
        objectMetadataId,
        configuration,
      );

      const filteredResults = filterOutEmptyChartBuckets({
        rawResults,
        shouldOmitEmptyBuckets: configuration.omitNullValues ?? false,
      });

      const relationLabelResolutions =
        await this.chartRelationLabelService.resolveRelationLabels({
          rawResults: filteredResults,
          primaryAxis: {
            groupByField: primaryAxisGroupByField,
            subFieldName: configuration.primaryAxisGroupBySubFieldName,
          },
          secondaryAxis:
            isTwoDimensional && isDefined(secondaryAxisGroupByField)
              ? {
                  groupByField: secondaryAxisGroupByField,
                  subFieldName: configuration.secondaryAxisGroupBySubFieldName,
                }
              : undefined,
          workspaceId,
          authContext,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        });

      const resolvedResults = filterOutUnresolvedRelationBuckets({
        rawResults: filteredResults,
        primaryRelationLabelResolution: relationLabelResolutions.primary,
        secondaryRelationLabelResolution: relationLabelResolutions.secondary,
      });

      if (isTwoDimensional && isDefined(secondaryAxisGroupByField)) {
        return this.transformToTwoDimensionalLineChartData({
          filteredRawResults: resolvedResults,
          primaryAxisGroupByField,
          secondaryAxisGroupByField,
          aggregateField,
          configuration,
          userTimezone,
          firstDayOfTheWeek,
          seriesIdPrefix,
          primaryRelationLabelResolution: relationLabelResolutions.primary,
          secondaryRelationLabelResolution: relationLabelResolutions.secondary,
        });
      }

      return this.transformToOneDimensionalLineChartData({
        filteredRawResults: resolvedResults,
        primaryAxisGroupByField,
        aggregateField,
        configuration,
        userTimezone,
        firstDayOfTheWeek,
        seriesIdPrefix,
        relationLabelResolution: relationLabelResolutions.primary,
      });
    } catch (error) {
      throw wrapChartDataQueryError(error, 'Line chart data retrieval failed');
    }
  }

  private transformToOneDimensionalLineChartData({
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
  }): LineChartDataDTO {
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

    const {
      processedDataPoints: rawProcessedDataPoints,
      formattedToRawLookup,
    } = processOneDimensionalResults({
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
  }

  private transformToTwoDimensionalLineChartData({
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
  }): LineChartDataDTO {
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
      secondaryDateGranularity:
        configuration.secondaryAxisGroupByDateGranularity,
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

    const sortedSeriesIds = this.sortSecondaryAxisSeriesIds({
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
  }

  private sortSecondaryAxisSeriesIds({
    seriesIds,
    seriesMap,
    configuration,
    secondaryFormattedToRawLookup,
    secondarySelectOptions,
    secondaryAxisGroupByField,
  }: {
    seriesIds: string[];
    seriesMap: Map<string, Map<string, number>>;
    configuration: LineChartConfigurationDTO;
    secondaryFormattedToRawLookup: Map<string, RawDimensionValue>;
    secondarySelectOptions: FieldMetadataOption[] | null;
    secondaryAxisGroupByField: FlatFieldMetadata;
  }): string[] {
    const orderBy = configuration.secondaryAxisOrderBy;

    if (!isDefined(orderBy)) {
      return seriesIds;
    }

    return sortSecondaryAxisData({
      items: seriesIds,
      orderBy,
      manualSortOrder: configuration.secondaryAxisManualSortOrder,
      formattedToRawLookup: secondaryFormattedToRawLookup,
      getFormattedValue: (id) => id,
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
      fieldType: secondaryAxisGroupByField.type,
      subFieldName: configuration.secondaryAxisGroupBySubFieldName ?? undefined,
      dateGranularity: configuration.secondaryAxisGroupByDateGranularity,
    });
  }
}
