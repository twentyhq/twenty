import { Injectable } from '@nestjs/common';

import { CalendarStartDay } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from 'src/modules/dashboard/chart-data/constants/extra-item-to-detect-too-many-groups.constant';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from 'src/modules/dashboard/chart-data/constants/pie-chart-maximum-number-of-slices.constant';
import { PieChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/pie-chart-data.dto';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';
import { ChartRelationLabelService } from 'src/modules/dashboard/chart-data/services/chart-relation-label.service';
import { filterOutEmptyChartBuckets } from 'src/modules/dashboard/chart-data/utils/filter-out-empty-chart-buckets.util';
import { filterOutUnresolvedRelationBuckets } from 'src/modules/dashboard/chart-data/utils/filter-out-unresolved-relation-buckets.util';
import { getFieldMetadata } from 'src/modules/dashboard/chart-data/utils/get-field-metadata.util';
import { wrapChartDataQueryError } from 'src/modules/dashboard/chart-data/utils/wrap-chart-data-query-error.util';
import { transformToPieChartData } from 'src/modules/dashboard/chart-data/utils/transform-to-pie-chart-data.util';

type GetPieChartDataParams = {
  workspaceId: string;
  objectMetadataId: string;
  configuration: PieChartConfigurationDTO;
  authContext: WorkspaceAuthContext;
};

@Injectable()
export class PieChartDataService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly chartDataQueryService: ChartDataQueryService,
    private readonly chartRelationLabelService: ChartRelationLabelService,
  ) {}

  async getPieChartData({
    workspaceId,
    objectMetadataId,
    configuration,
    authContext,
  }: GetPieChartDataParams): Promise<PieChartDataDTO> {
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

      const { idByNameSingular: objectIdByNameSingular } =
        buildObjectIdByNameMaps(flatObjectMetadataMaps);

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

      const filteredResults = filterOutEmptyChartBuckets({
        rawResults,
        shouldOmitEmptyBuckets: configuration.hideEmptyCategory ?? false,
      });

      const relationLabelResolutions =
        await this.chartRelationLabelService.resolveRelationLabels({
          rawResults: filteredResults,
          primaryAxis: {
            groupByField,
            subFieldName: configuration.groupBySubFieldName,
          },
          workspaceId,
          authContext,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        });

      const resolvedResults = filterOutUnresolvedRelationBuckets({
        rawResults: filteredResults,
        primaryRelationLabelResolution: relationLabelResolutions.primary,
        secondaryRelationLabelResolution: undefined,
      });

      return transformToPieChartData({
        filteredRawResults: resolvedResults,
        groupByField,
        configuration,
        userTimezone: configuration.timezone ?? 'UTC',
        firstDayOfTheWeek:
          (configuration.firstDayOfTheWeek as CalendarStartDay | undefined) ??
          CalendarStartDay.MONDAY,
        relationLabelResolution: relationLabelResolutions.primary,
      });
    } catch (error) {
      throw wrapChartDataQueryError(error, 'Pie chart data retrieval failed');
    }
  }
}
