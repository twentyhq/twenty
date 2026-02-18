import { Injectable } from '@nestjs/common';

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
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from 'src/modules/dashboard/chart-data/constants/extra-item-to-detect-too-many-groups.constant';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from 'src/modules/dashboard/chart-data/constants/pie-chart-maximum-number-of-slices.constant';
import { PieChartDataOutputDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/pie-chart-data-output.dto';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';
import { getFieldMetadata } from 'src/modules/dashboard/chart-data/utils/get-field-metadata.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';
import { processOneDimensionalResults } from 'src/modules/dashboard/chart-data/utils/process-one-dimensional-results.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data-if-needed.util';

type GetPieChartDataParams = {
  workspaceId: string;
  objectMetadataId: string;
  configuration: PieChartConfigurationDTO;
  authContext: AuthContext;
};

@Injectable()
export class PieChartDataService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly chartDataQueryService: ChartDataQueryService,
  ) {}

  async getPieChartData({
    workspaceId,
    objectMetadataId,
    configuration,
    authContext,
  }: GetPieChartDataParams): Promise<PieChartDataOutputDTO> {
    try {
      if (
        configuration.configurationType !== WidgetConfigurationType.PIE_CHART
      ) {
        throw new ChartDataException(
          generateChartDataExceptionMessage(
            ChartDataExceptionCode.INVALID_WIDGET_CONFIGURATION,
            `Expected PIE_CHART, got ${configuration.configurationType}`,
          ),
          ChartDataExceptionCode.INVALID_WIDGET_CONFIGURATION,
        );
      }

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

      const groupByField = getFieldMetadata(
        configuration.groupByFieldMetadataId,
        flatFieldMetadataMaps,
      );

      const limit =
        PIE_CHART_MAXIMUM_NUMBER_OF_SLICES +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS;

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
        groupByFieldMetadataId: configuration.groupByFieldMetadataId,
        groupBySubFieldName: configuration.groupBySubFieldName,
        aggregateFieldMetadataId: configuration.aggregateFieldMetadataId,
        aggregateOperation: configuration.aggregateOperation,
        filter: configuration.filter,
        dateGranularity: configuration.dateGranularity,
        userTimezone: configuration.timezone ?? 'UTC',
        firstDayOfTheWeek:
          (configuration.firstDayOfTheWeek as CalendarStartDay | undefined) ??
          CalendarStartDay.MONDAY,
        limit,
        primaryAxisOrderBy: configuration.orderBy,
        splitMultiValueFields: configuration.splitMultiValueFields,
      });

      return this.transformToPieChartData({
        rawResults,
        groupByField,
        configuration,
        userTimezone: configuration.timezone ?? 'UTC',
        firstDayOfTheWeek:
          (configuration.firstDayOfTheWeek as CalendarStartDay | undefined) ??
          CalendarStartDay.MONDAY,
      });
    } catch (error) {
      if (error instanceof ChartDataException) {
        throw error;
      }

      throw new ChartDataException(
        generateChartDataExceptionMessage(
          ChartDataExceptionCode.QUERY_EXECUTION_FAILED,
          `Pie chart data retrieval failed: ${error instanceof Error ? error.message : String(error)}`,
        ),
        ChartDataExceptionCode.QUERY_EXECUTION_FAILED,
      );
    }
  }

  private transformToPieChartData({
    rawResults,
    groupByField,
    configuration,
    userTimezone,
    firstDayOfTheWeek,
  }: {
    rawResults: Array<{
      groupByDimensionValues: unknown[];
      aggregateValue: number;
    }>;
    groupByField: FlatFieldMetadata;
    configuration: PieChartConfigurationDTO;
    userTimezone: string;
    firstDayOfTheWeek: CalendarStartDay;
  }): PieChartDataOutputDTO {
    const filteredResults = configuration.hideEmptyCategory
      ? rawResults.filter(
          (result) =>
            isDefined(result.groupByDimensionValues?.[0]) &&
            result.aggregateValue !== 0,
        )
      : rawResults;

    const selectOptions = getSelectOptions(groupByField);

    const convertedFirstDayOfTheWeek =
      convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
        firstDayOfTheWeek,
        FirstDayOfTheWeek.SUNDAY,
      );

    const limitedResults = filteredResults.slice(
      0,
      PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
    );

    const {
      processedDataPoints: rawProcessedDataPoints,
      formattedToRawLookup,
    } = processOneDimensionalResults({
      rawResults: limitedResults,
      primaryAxisGroupByField: groupByField,
      dateGranularity: configuration.dateGranularity,
      subFieldName: configuration.groupBySubFieldName,
      userTimezone,
      firstDayOfTheWeek: convertedFirstDayOfTheWeek,
    });

    const processedDataPoints = rawProcessedDataPoints.map((point) => {
      const rawValueString = isDefined(point.rawValue)
        ? String(point.rawValue)
        : null;

      return {
        id: point.formattedValue,
        value: point.aggregateValue,
        rawValue: rawValueString,
      };
    });

    const sortedData = sortChartDataIfNeeded({
      data: processedDataPoints,
      orderBy: configuration.orderBy,
      manualSortOrder: configuration.manualSortOrder,
      formattedToRawLookup,
      getFieldValue: (item) => item.id,
      getNumericValue: (item) => item.value,
      selectFieldOptions: selectOptions,
      fieldType: groupByField.type,
      dateGranularity: configuration.dateGranularity,
    });

    const data = sortedData.map(({ rawValue: _rawValue, ...item }) => item);

    return {
      data,
      showLegend: configuration.displayLegend ?? true,
      showDataLabels: configuration.displayDataLabel ?? false,
      showCenterMetric: configuration.showCenterMetric ?? true,
      hasTooManyGroups:
        filteredResults.length > PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
      formattedToRawLookup: Object.fromEntries(formattedToRawLookup),
    };
  }
}
