import { Injectable } from '@nestjs/common';

import { isNumber } from '@sniptt/guards';
import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  capitalize,
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  isDefined,
} from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from 'src/modules/dashboard/chart-data/constants/bar-chart-maximum-number-of-bars.constant';
import { BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR } from 'src/modules/dashboard/chart-data/constants/bar-chart-maximum-number-of-groups-per-bar.constant';
import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from 'src/modules/dashboard/chart-data/constants/extra-item-to-detect-too-many-groups.constant';
import { BarChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/bar-chart-data.dto';
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
import { applyCumulativeToOneDimensionalBarData } from 'src/modules/dashboard/chart-data/utils/apply-cumulative-to-one-dimensional-bar-data.util';
import { applyCumulativeToTwoDimensionalBarData } from 'src/modules/dashboard/chart-data/utils/apply-cumulative-to-two-dimensional-bar-data.util';
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
import { wrapChartDataQueryError } from 'src/modules/dashboard/chart-data/utils/wrap-chart-data-query-error.util';

type GetBarChartDataParams = {
  workspaceId: string;
  objectMetadataId: string;
  configuration: BarChartConfigurationDTO;
  authContext: WorkspaceAuthContext;
};

@Injectable()
export class BarChartDataService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly chartDataQueryService: ChartDataQueryService,
    private readonly chartRelationLabelService: ChartRelationLabelService,
  ) {}

  async getBarChartData({
    workspaceId,
    objectMetadataId,
    configuration,
    authContext,
  }: GetBarChartDataParams): Promise<BarChartDataDTO> {
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
        return this.transformToTwoDimensionalBarChartData({
          filteredRawResults: resolvedResults,
          primaryAxisGroupByField,
          secondaryAxisGroupByField,
          aggregateField,
          configuration,
          userTimezone,
          firstDayOfTheWeek,
          primaryRelationLabelResolution: relationLabelResolutions.primary,
          secondaryRelationLabelResolution: relationLabelResolutions.secondary,
        });
      }

      return this.transformToOneDimensionalBarChartData({
        filteredRawResults: resolvedResults,
        primaryAxisGroupByField,
        aggregateField,
        configuration,
        userTimezone,
        firstDayOfTheWeek,
        relationLabelResolution: relationLabelResolutions.primary,
      });
    } catch (error) {
      throw wrapChartDataQueryError(error, 'Bar chart data retrieval failed');
    }
  }

  private transformToOneDimensionalBarChartData({
    filteredRawResults,
    primaryAxisGroupByField,
    aggregateField,
    configuration,
    userTimezone,
    firstDayOfTheWeek,
    relationLabelResolution,
  }: {
    filteredRawResults: GroupByRawResult[];
    primaryAxisGroupByField: FlatFieldMetadata;
    aggregateField: FlatFieldMetadata;
    configuration: BarChartConfigurationDTO;
    userTimezone: string;
    firstDayOfTheWeek: CalendarStartDay;
    relationLabelResolution: RelationLabelResolution | undefined;
  }): BarChartDataDTO {
    const layout = configuration.layout ?? BarChartLayout.VERTICAL;
    const isHorizontal = layout === BarChartLayout.HORIZONTAL;

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

    const indexByKey = configuration.primaryAxisGroupBySubFieldName
      ? `${primaryAxisGroupByField.name}${capitalize(configuration.primaryAxisGroupBySubFieldName)}`
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
        relationLabelResolution,
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
      ? applyCumulativeToOneDimensionalBarData(limitedSortedData)
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
        filteredRawResults.length > BAR_CHART_MAXIMUM_NUMBER_OF_BARS ||
        dateRangeWasTruncated,
      formattedToRawLookup: buildFormattedToRawLookupDto({
        axisLookups: [{ formattedToRawLookup, relationLabelResolution }],
      }),
    };
  }

  private transformToTwoDimensionalBarChartData({
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
  }): BarChartDataDTO {
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
      secondaryDateGranularity:
        configuration.secondaryAxisGroupByDateGranularity,
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
      const hasTooManySegments =
        totalSegments > BAR_CHART_MAXIMUM_NUMBER_OF_BARS;

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
}
