import { Injectable } from '@nestjs/common';

import { FieldMetadataType, FirstDayOfTheWeek } from 'twenty-shared/types';
import { isDefined, isFieldMetadataSelectKind } from 'twenty-shared/utils';

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
import { determineChartItemColor } from 'src/modules/dashboard/chart-data/utils/determine-chart-item-color.util';
import { determineGraphColorMode } from 'src/modules/dashboard/chart-data/utils/determine-graph-color-mode.util';
import { parseGraphColor } from 'src/modules/dashboard/chart-data/utils/parse-graph-color.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data.util';

type GetPieChartDataParams = {
  workspaceId: string;
  objectMetadataId: string;
  configuration: PieChartConfigurationDTO;
};

type FieldMetadataOption = {
  value: string;
  label: string;
  color?: string;
  position: number;
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

    const groupByField = this.getFieldMetadata(
      configuration.groupByFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const aggregateField = this.getFieldMetadata(
      configuration.aggregateFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const limit =
      PIE_CHART_MAXIMUM_NUMBER_OF_SLICES + EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS;

    const rawResults = await this.chartDataQueryService.executeGroupByQuery({
      workspaceId,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      groupByFieldMetadataId: configuration.groupByFieldMetadataId,
      groupBySubFieldName: configuration.groupBySubFieldName,
      aggregateFieldMetadataId: configuration.aggregateFieldMetadataId,
      aggregateOperation: configuration.aggregateOperation,
      filter: configuration.filter,
      dateGranularity: configuration.dateGranularity,
      userTimezone: configuration.timezone ?? 'UTC',
      firstDayOfTheWeek:
        (configuration.firstDayOfTheWeek as FirstDayOfTheWeek | undefined) ??
        FirstDayOfTheWeek.MONDAY,
      limit,
    });

    return this.transformToPieChartData({
      rawResults,
      groupByField,
      aggregateField,
      configuration,
      userTimezone: configuration.timezone ?? 'UTC',
      firstDayOfTheWeek:
        (configuration.firstDayOfTheWeek as FirstDayOfTheWeek | undefined) ??
        FirstDayOfTheWeek.MONDAY,
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

  private transformToPieChartData({
    rawResults,
    groupByField,
    aggregateField: _aggregateField,
    configuration,
    userTimezone: _userTimezone,
    firstDayOfTheWeek: _firstDayOfTheWeek,
  }: {
    rawResults: Array<{
      groupByDimensionValues: unknown[];
      aggregateValue: number;
    }>;
    groupByField: FlatFieldMetadata;
    aggregateField: FlatFieldMetadata;
    configuration: PieChartConfigurationDTO;
    userTimezone: string;
    firstDayOfTheWeek: FirstDayOfTheWeek;
  }): PieChartDataOutputDTO {
    const filteredResults = configuration.hideEmptyCategory
      ? rawResults.filter((result) =>
          isDefined(result.groupByDimensionValues?.[0]),
        )
      : rawResults;

    const formattedToRawLookup = new Map<string, RawDimensionValue>();
    const selectOptions = this.getSelectOptions(groupByField);

    const processedDataPoints = filteredResults
      .slice(0, PIE_CHART_MAXIMUM_NUMBER_OF_SLICES)
      .map((result) => {
        const rawValue = result
          .groupByDimensionValues?.[0] as RawDimensionValue;
        const formattedValue = this.formatDimensionValue(
          rawValue,
          groupByField,
          selectOptions,
        );

        if (isDefined(rawValue)) {
          formattedToRawLookup.set(formattedValue, rawValue);
        }

        const rawValueString = isDefined(rawValue) ? String(rawValue) : null;

        return {
          id: formattedValue,
          value: result.aggregateValue,
          color: determineChartItemColor({
            configurationColor: parseGraphColor(configuration.color),
            selectOptions,
            rawValue: rawValueString,
          }),
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

    const colorMode = determineGraphColorMode({
      configurationColor: configuration.color,
      selectFieldOptions: selectOptions,
    });

    return {
      data,
      showLegend: configuration.displayLegend ?? true,
      showDataLabels: configuration.displayDataLabel ?? false,
      showCenterMetric: configuration.showCenterMetric ?? true,
      hasTooManyGroups:
        filteredResults.length > PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
      colorMode,
      formattedToRawLookup: Object.fromEntries(formattedToRawLookup),
    };
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
}
