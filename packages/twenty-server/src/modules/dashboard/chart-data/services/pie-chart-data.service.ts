import { Injectable } from '@nestjs/common';

import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  isDefined,
} from 'twenty-shared/utils';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
  PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
} from 'src/modules/dashboard/chart-data/constants/pie-chart.constants';
import { PieChartDataItemDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/pie-chart-data-item.dto';
import { PieChartDataOutputDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/pie-chart-data-output.dto';
import {
  ChartDataException,
  ChartDataExceptionCode,
  ChartDataExceptionMessageKey,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';
import { RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { formatDimensionValue } from 'src/modules/dashboard/chart-data/utils/format-dimension-value.util';
import { getFieldMetadata } from 'src/modules/dashboard/chart-data/utils/get-field-metadata.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data.util';

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
    if (configuration.configurationType !== WidgetConfigurationType.PIE_CHART) {
      throw new ChartDataException(
        generateChartDataExceptionMessage(
          ChartDataExceptionMessageKey.INVALID_WIDGET_CONFIGURATION,
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

    const groupByField = getFieldMetadata(
      configuration.groupByFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const aggregateField = getFieldMetadata(
      configuration.aggregateFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const limit =
      PIE_CHART_MAXIMUM_NUMBER_OF_SLICES + EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS;

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
    });

    return this.transformToPieChartData({
      rawResults,
      groupByField,
      aggregateField,
      configuration,
      userTimezone: configuration.timezone ?? 'UTC',
      firstDayOfTheWeek:
        (configuration.firstDayOfTheWeek as CalendarStartDay | undefined) ??
        CalendarStartDay.MONDAY,
    });
  }

  private transformToPieChartData({
    rawResults,
    groupByField,
    aggregateField: _aggregateField,
    configuration,
    userTimezone,
    firstDayOfTheWeek,
  }: {
    rawResults: Array<{
      groupByDimensionValues: unknown[];
      aggregateValue: number;
    }>;
    groupByField: FlatFieldMetadata;
    aggregateField: FlatFieldMetadata;
    configuration: PieChartConfigurationDTO;
    userTimezone: string;
    firstDayOfTheWeek: CalendarStartDay;
  }): PieChartDataOutputDTO {
    const filteredResults = configuration.hideEmptyCategory
      ? rawResults.filter((result) =>
          isDefined(result.groupByDimensionValues?.[0]),
        )
      : rawResults;

    const formattedToRawLookup = new Map<string, RawDimensionValue>();
    const selectOptions = getSelectOptions(groupByField);

    const convertedFirstDayOfTheWeek =
      convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
        firstDayOfTheWeek,
        FirstDayOfTheWeek.SUNDAY,
      );

    const processedDataPoints = filteredResults
      .slice(0, PIE_CHART_MAXIMUM_NUMBER_OF_SLICES)
      .map((result) => {
        const rawValue = result
          .groupByDimensionValues?.[0] as RawDimensionValue;

        const formattedValue = formatDimensionValue({
          value: rawValue,
          fieldMetadata: groupByField,
          dateGranularity: configuration.dateGranularity,
          subFieldName: configuration.groupBySubFieldName,
          userTimezone: userTimezone,
          firstDayOfTheWeek: convertedFirstDayOfTheWeek,
        });

        if (isDefined(rawValue)) {
          formattedToRawLookup.set(formattedValue, rawValue);
        }

        const rawValueString = isDefined(rawValue) ? String(rawValue) : null;

        return {
          id: formattedValue,
          value: result.aggregateValue,
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
    });

    const data: PieChartDataItemDTO[] = sortedData.map(
      ({ rawValue: _rawValue, ...item }) => item,
    );

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
