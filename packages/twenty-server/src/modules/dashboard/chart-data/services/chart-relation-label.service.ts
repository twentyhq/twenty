import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { CHART_RELATION_LABEL_BATCH_SIZE } from 'src/modules/dashboard/chart-data/constants/chart-relation-label-batch-size.constant';
import { type ChartRelationLabelAxisInput } from 'src/modules/dashboard/chart-data/types/chart-relation-label-axis-input.type';
import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { type RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';
import { type ResolvableChartRelationAxis } from 'src/modules/dashboard/chart-data/types/resolvable-chart-relation-axis.type';
import { buildRawLabelByRecordId } from 'src/modules/dashboard/chart-data/utils/build-raw-label-by-record-id.util';
import { buildResolvableChartRelationAxis } from 'src/modules/dashboard/chart-data/utils/build-resolvable-chart-relation-axis.util';
import { buildUniqueRelationLabels } from 'src/modules/dashboard/chart-data/utils/build-unique-relation-labels.util';

type ResolveRelationLabelsParams = {
  rawResults: GroupByRawResult[];
  primaryAxis: ChartRelationLabelAxisInput;
  secondaryAxis?: ChartRelationLabelAxisInput;
  workspaceId: string;
  authContext: WorkspaceAuthContext;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

@Injectable()
export class ChartRelationLabelService {
  private readonly logger = new Logger(ChartRelationLabelService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async resolveRelationLabels({
    rawResults,
    primaryAxis,
    secondaryAxis,
    workspaceId,
    authContext,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: ResolveRelationLabelsParams): Promise<{
    primary?: RelationLabelResolution;
    secondary?: RelationLabelResolution;
  }> {
    const axisInputs = [
      { dimensionIndex: 0, axis: primaryAxis },
      ...(isDefined(secondaryAxis)
        ? [{ dimensionIndex: 1, axis: secondaryAxis }]
        : []),
    ];

    const resolvableAxes = axisInputs
      .map(({ dimensionIndex, axis }) =>
        buildResolvableChartRelationAxis({
          dimensionIndex,
          axis,
          rawResults,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        }),
      )
      .filter(isDefined);

    if (!isNonEmptyArray(resolvableAxes)) {
      return {};
    }

    const rawLabelsByTargetObjectId = await this.fetchRawLabelsPerTargetObject({
      resolvableAxes,
      workspaceId,
      authContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const resolutionByDimensionIndex = new Map<
      number,
      RelationLabelResolution
    >();

    for (const resolvableAxis of resolvableAxes) {
      const rawLabelByRecordId =
        rawLabelsByTargetObjectId.get(
          resolvableAxis.targetFlatObjectMetadata.id,
        ) ?? new Map<string, string>();

      resolutionByDimensionIndex.set(
        resolvableAxis.dimensionIndex,
        buildUniqueRelationLabels({
          rawLabelByRecordId,
          allRecordIds: resolvableAxis.recordIds,
        }),
      );
    }

    return {
      primary: resolutionByDimensionIndex.get(0),
      secondary: resolutionByDimensionIndex.get(1),
    };
  }

  private async fetchRawLabelsPerTargetObject({
    resolvableAxes,
    workspaceId,
    authContext,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    resolvableAxes: ResolvableChartRelationAxis[];
    workspaceId: string;
    authContext: WorkspaceAuthContext;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Promise<Map<string, Map<string, string>>> {
    const rawLabelsByTargetObjectId = new Map<string, Map<string, string>>();

    const axesByTargetObjectId = new Map<
      string,
      {
        targetFlatObjectMetadata: FlatObjectMetadata;
        labelIdentifierColumnNames: string[];
        recordIds: Set<string>;
      }
    >();

    for (const resolvableAxis of resolvableAxes) {
      const targetObjectId = resolvableAxis.targetFlatObjectMetadata.id;
      const existingAxesGroup = axesByTargetObjectId.get(targetObjectId);

      if (!isDefined(existingAxesGroup)) {
        axesByTargetObjectId.set(targetObjectId, {
          targetFlatObjectMetadata: resolvableAxis.targetFlatObjectMetadata,
          labelIdentifierColumnNames: resolvableAxis.labelIdentifierColumnNames,
          recordIds: new Set(resolvableAxis.recordIds),
        });
        continue;
      }

      for (const recordId of resolvableAxis.recordIds) {
        existingAxesGroup.recordIds.add(recordId);
      }
    }

    await Promise.all(
      [...axesByTargetObjectId.values()].map(
        async ({
          targetFlatObjectMetadata,
          labelIdentifierColumnNames,
          recordIds,
        }) => {
          const records = await this.fetchLabelIdentifierRecords({
            targetFlatObjectMetadata,
            labelIdentifierColumnNames,
            recordIds: [...recordIds],
            workspaceId,
            authContext,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          });

          rawLabelsByTargetObjectId.set(
            targetFlatObjectMetadata.id,
            buildRawLabelByRecordId({
              records,
              targetFlatObjectMetadata,
              flatFieldMetadataMaps,
            }),
          );
        },
      ),
    );

    return rawLabelsByTargetObjectId;
  }

  private async fetchLabelIdentifierRecords({
    targetFlatObjectMetadata,
    labelIdentifierColumnNames,
    recordIds,
    workspaceId,
    authContext,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    targetFlatObjectMetadata: FlatObjectMetadata;
    labelIdentifierColumnNames: string[];
    recordIds: string[];
    workspaceId: string;
    authContext: WorkspaceAuthContext;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Promise<Record<string, unknown>[]> {
    try {
      return await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workspaceContext = getWorkspaceContext();
          const rolePermissionConfig = resolveRolePermissionConfig({
            authContext: workspaceContext.authContext,
            userWorkspaceRoleMap: workspaceContext.userWorkspaceRoleMap,
            apiKeyRoleMap: workspaceContext.apiKeyRoleMap,
          });

          if (!isDefined(rolePermissionConfig)) {
            return [];
          }

          const repository = await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            targetFlatObjectMetadata.nameSingular,
            rolePermissionConfig,
          );

          const alias = targetFlatObjectMetadata.nameSingular;

          const rawRowChunks = await Promise.all(
            chunk(recordIds, CHART_RELATION_LABEL_BATCH_SIZE).map(
              (recordIdChunk) => {
                const queryBuilder = repository.createQueryBuilder(alias);

                queryBuilder.select([]);

                for (const columnName of labelIdentifierColumnNames) {
                  queryBuilder.addSelect(
                    `"${alias}"."${columnName}"`,
                    columnName,
                  );
                }

                return queryBuilder
                  .where(`${alias}.id IN (:...recordIdChunk)`, {
                    recordIdChunk,
                  })
                  .getRawMany();
              },
            ),
          );

          const fieldMapsForObject = buildFieldMapsFromFlatObjectMetadata(
            flatFieldMetadataMaps,
            targetFlatObjectMetadata,
          );

          return formatResult<Record<string, unknown>[]>(
            rawRowChunks.flat(),
            targetFlatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            fieldMapsForObject,
          );
        },
        authContext,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to resolve relation labels for object ${targetFlatObjectMetadata.nameSingular}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return [];
    }
  }
}
