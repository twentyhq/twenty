import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { CHART_RELATION_LABEL_BATCH_SIZE } from 'src/modules/dashboard/chart-data/constants/chart-relation-label-batch-size.constant';
import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { type RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';
import { buildUniqueRelationLabels } from 'src/modules/dashboard/chart-data/utils/build-unique-relation-labels.util';
import { getRelationLabelIdentifierColumns } from 'src/modules/dashboard/chart-data/utils/get-relation-label-identifier-columns.util';

type ChartRelationLabelAxisInput = {
  groupByField: FlatFieldMetadata;
  subFieldName?: string | null;
};

type ResolvableAxis = {
  dimensionIndex: number;
  targetFlatObjectMetadata: FlatObjectMetadata;
  columns: string[];
  recordIds: string[];
};

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

    const resolvableAxes: ResolvableAxis[] = [];

    for (const { dimensionIndex, axis } of axisInputs) {
      const resolvableAxis = this.buildResolvableAxis({
        dimensionIndex,
        axis,
        rawResults,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      if (isDefined(resolvableAxis)) {
        resolvableAxes.push(resolvableAxis);
      }
    }

    if (resolvableAxes.length === 0) {
      return {};
    }

    const rawLabelsByTargetObjectId = new Map<string, Map<string, string>>();

    for (const resolvableAxis of resolvableAxes) {
      const targetObjectId = resolvableAxis.targetFlatObjectMetadata.id;

      if (rawLabelsByTargetObjectId.has(targetObjectId)) {
        continue;
      }

      const recordIds = [
        ...new Set(
          resolvableAxes
            .filter(
              (axis) => axis.targetFlatObjectMetadata.id === targetObjectId,
            )
            .flatMap((axis) => axis.recordIds),
        ),
      ];

      rawLabelsByTargetObjectId.set(
        targetObjectId,
        await this.fetchRawLabels({
          targetFlatObjectMetadata: resolvableAxis.targetFlatObjectMetadata,
          columns: resolvableAxis.columns,
          recordIds,
          workspaceId,
          authContext,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        }),
      );
    }

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

  private buildResolvableAxis({
    dimensionIndex,
    axis,
    rawResults,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    dimensionIndex: number;
    axis: ChartRelationLabelAxisInput;
    rawResults: GroupByRawResult[];
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): ResolvableAxis | undefined {
    if (
      !isMorphOrRelationFlatFieldMetadata(axis.groupByField) ||
      isDefined(axis.subFieldName)
    ) {
      return undefined;
    }

    const targetObjectMetadataId =
      axis.groupByField.relationTargetObjectMetadataId;

    if (!isDefined(targetObjectMetadataId)) {
      return undefined;
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: targetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(targetFlatObjectMetadata)) {
      return undefined;
    }

    const labelIdentifierColumns = getRelationLabelIdentifierColumns({
      flatObjectMetadata: targetFlatObjectMetadata,
      flatFieldMetadataMaps,
    });

    if (!isDefined(labelIdentifierColumns)) {
      return undefined;
    }

    const recordIds = [
      ...new Set(
        rawResults
          .map((result) => result.groupByDimensionValues?.[dimensionIndex])
          .filter(
            (value): value is string =>
              typeof value === 'string' && value.length > 0,
          ),
      ),
    ];

    if (recordIds.length === 0) {
      return undefined;
    }

    return {
      dimensionIndex,
      targetFlatObjectMetadata,
      columns: labelIdentifierColumns.columns,
      recordIds,
    };
  }

  private async fetchRawLabels({
    targetFlatObjectMetadata,
    columns,
    recordIds,
    workspaceId,
    authContext,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    targetFlatObjectMetadata: FlatObjectMetadata;
    columns: string[];
    recordIds: string[];
    workspaceId: string;
    authContext: WorkspaceAuthContext;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Promise<Map<string, string>> {
    try {
      const records =
        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const context = getWorkspaceContext();
            const rolePermissionConfig = resolveRolePermissionConfig({
              authContext: context.authContext,
              userWorkspaceRoleMap: context.userWorkspaceRoleMap,
              apiKeyRoleMap: context.apiKeyRoleMap,
            });

            if (!rolePermissionConfig) {
              return [];
            }

            const repository =
              await this.globalWorkspaceOrmManager.getRepository(
                workspaceId,
                targetFlatObjectMetadata.nameSingular,
                rolePermissionConfig,
              );

            const alias = targetFlatObjectMetadata.nameSingular;
            const recordIdChunks: string[][] = [];

            for (
              let chunkStart = 0;
              chunkStart < recordIds.length;
              chunkStart += CHART_RELATION_LABEL_BATCH_SIZE
            ) {
              recordIdChunks.push(
                recordIds.slice(
                  chunkStart,
                  chunkStart + CHART_RELATION_LABEL_BATCH_SIZE,
                ),
              );
            }

            const rawRowChunks = await Promise.all(
              recordIdChunks.map((recordIdChunk) => {
                const queryBuilder = repository.createQueryBuilder(alias);

                queryBuilder.select([]);

                for (const column of columns) {
                  queryBuilder.addSelect(`"${alias}"."${column}"`, column);
                }

                return queryBuilder
                  .where(`${alias}.id IN (:...recordIdChunk)`, {
                    recordIdChunk,
                  })
                  .getRawMany();
              }),
            );

            return rawRowChunks
              .flat()
              .map((rawRow) =>
                formatResult<Record<string, unknown>>(
                  rawRow,
                  targetFlatObjectMetadata,
                  flatObjectMetadataMaps,
                  flatFieldMetadataMaps,
                ),
              );
          },
          authContext,
        );

      const rawLabelByRecordId = new Map<string, string>();

      for (const record of records) {
        const recordId = String(record.id);
        const displayName = getRecordDisplayName(
          record,
          targetFlatObjectMetadata,
          flatFieldMetadataMaps,
        );

        if (displayName === recordId) {
          continue;
        }

        rawLabelByRecordId.set(recordId, displayName);
      }

      return rawLabelByRecordId;
    } catch (error) {
      this.logger.warn(
        `Failed to resolve relation labels for object ${targetFlatObjectMetadata.nameSingular}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return new Map();
    }
  }
}
