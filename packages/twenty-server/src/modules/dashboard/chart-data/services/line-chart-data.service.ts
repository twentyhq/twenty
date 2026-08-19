import { Injectable } from '@nestjs/common';

import { CalendarStartDay } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
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
import { filterOutEmptyChartBuckets } from 'src/modules/dashboard/chart-data/utils/filter-out-empty-chart-buckets.util';
import { filterOutUnresolvedRelationBuckets } from 'src/modules/dashboard/chart-data/utils/filter-out-unresolved-relation-buckets.util';
import { getFieldMetadata } from 'src/modules/dashboard/chart-data/utils/get-field-metadata.util';
import { buildLineChartSeriesIdPrefix } from 'src/modules/dashboard/chart-data/utils/build-line-chart-series-id-prefix.util';
import { wrapChartDataQueryError } from 'src/modules/dashboard/chart-data/utils/wrap-chart-data-query-error.util';
import { transformToOneDimensionalLineChartData } from 'src/modules/dashboard/chart-data/utils/transform-to-one-dimensional-line-chart-data.util';
import { transformToTwoDimensionalLineChartData } from 'src/modules/dashboard/chart-data/utils/transform-to-two-dimensional-line-chart-data.util';

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
        return transformToTwoDimensionalLineChartData({
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

      return transformToOneDimensionalLineChartData({
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
}
