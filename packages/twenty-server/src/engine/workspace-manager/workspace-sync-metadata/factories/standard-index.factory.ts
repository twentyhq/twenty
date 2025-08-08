import { Injectable } from '@nestjs/common';

import { type PartialIndexMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-index-metadata.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

@Injectable()
export class StandardIndexFactory {
  create(
    standardObjectMetadataDefinitions: (typeof BaseWorkspaceEntity)[],
    context: WorkspaceSyncContext,
    originalStandardObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    originalCustomObjectMetadataMap: Record<string, ObjectMetadataEntity>,
  ): Partial<IndexMetadataEntity>[] {
    const standardIndexOnStandardObjects =
      standardObjectMetadataDefinitions.flatMap((standardObjectMetadata) =>
        this.createStandardIndexMetadataForStandardObject(
          standardObjectMetadata,
          context,
          originalStandardObjectMetadataMap,
        ),
      );

    const standardIndexesOnCustomObjects =
      this.createStandardIndexMetadataForCustomObject(
        context,
        originalCustomObjectMetadataMap,
      );

    return [
      standardIndexOnStandardObjects,
      standardIndexesOnCustomObjects,
    ].flat();
  }

  private createStandardIndexMetadataForStandardObject(
    target: typeof BaseWorkspaceEntity,
    context: WorkspaceSyncContext,
    originalStandardObjectMetadataMap: Record<string, ObjectMetadataEntity>,
  ): Partial<IndexMetadataEntity>[] {
    const workspaceEntity = metadataArgsStorage.filterEntities(target);

    if (!workspaceEntity) {
      throw new Error(
        `Object metadata decorator not found, can't parse ${target.name}`,
      );
    }

    if (isGatedAndNotEnabled(workspaceEntity?.gate, context.featureFlags)) {
      return [];
    }

    const workspaceIndexMetadataArgsCollection = metadataArgsStorage
      .filterIndexes(target)
      .filter((workspaceIndexMetadataArgs) => {
        return !isGatedAndNotEnabled(
          workspaceIndexMetadataArgs.gate,
          context.featureFlags,
        );
      });

    return workspaceIndexMetadataArgsCollection.map(
      (workspaceIndexMetadataArgs) => {
        const objectMetadata =
          originalStandardObjectMetadataMap[workspaceEntity.nameSingular];

        if (!objectMetadata) {
          throw new Error(
            `Object metadata not found for ${workspaceEntity.nameSingular}`,
          );
        }

        const indexMetadata: PartialIndexMetadata = {
          workspaceId: context.workspaceId,
          objectMetadataId: objectMetadata.id,
          name: workspaceIndexMetadataArgs.name,
          columns: workspaceIndexMetadataArgs.columns,
          isUnique: workspaceIndexMetadataArgs.isUnique,
          isCustom: false,
          indexWhereClause: workspaceIndexMetadataArgs.whereClause,
          indexType: workspaceIndexMetadataArgs.type ?? IndexType.BTREE,
        };

        return indexMetadata;
      },
    );
  }

  private createStandardIndexMetadataForCustomObject(
    context: WorkspaceSyncContext,
    originalCustomObjectMetadataMap: Record<string, ObjectMetadataEntity>,
  ): Partial<IndexMetadataEntity>[] {
    const target = CustomWorkspaceEntity;
    const workspaceEntity = metadataArgsStorage.filterExtendedEntities(target);

    if (!workspaceEntity) {
      throw new Error(
        `Object metadata decorator not found, can't parse ${target.name}`,
      );
    }

    const workspaceIndexMetadataArgsCollection = metadataArgsStorage
      .filterIndexes(target)
      .filter((workspaceIndexMetadataArgs) => {
        return !isGatedAndNotEnabled(
          workspaceIndexMetadataArgs.gate,
          context.featureFlags,
        );
      });

    return Object.entries(originalCustomObjectMetadataMap).flatMap(
      ([customObjectName, customObjectMetadata]) => {
        return workspaceIndexMetadataArgsCollection.map(
          (workspaceIndexMetadataArgs) => {
            const indexMetadata: PartialIndexMetadata = {
              workspaceId: context.workspaceId,
              objectMetadataId: customObjectMetadata.id,
              name: `IDX_${generateDeterministicIndexName([computeTableName(customObjectName, true), ...workspaceIndexMetadataArgs.columns])}`,
              columns: workspaceIndexMetadataArgs.columns,
              isCustom: false,
              isUnique: workspaceIndexMetadataArgs.isUnique,
              indexType: workspaceIndexMetadataArgs.type ?? IndexType.BTREE,
              indexWhereClause: workspaceIndexMetadataArgs.whereClause,
            };

            return indexMetadata;
          },
        );
      },
    );
  }
}
