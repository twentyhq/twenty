import { Injectable } from '@nestjs/common';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { PartialIndexMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-index-metadata.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

@Injectable()
export class StandardIndexFactory {
  create(
    standardObjectMetadataDefinitions: (typeof BaseWorkspaceEntity)[],
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<IndexMetadataEntity>[] {
    return standardObjectMetadataDefinitions.flatMap((standardObjectMetadata) =>
      this.createIndexMetadata(
        standardObjectMetadata,
        context,
        originalObjectMetadataMap,
        workspaceFeatureFlagsMap,
      ),
    );
  }

  private createIndexMetadata(
    target: typeof BaseWorkspaceEntity,
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<IndexMetadataEntity>[] {
    const workspaceEntity = metadataArgsStorage.filterEntities(target);

    if (!workspaceEntity) {
      throw new Error(
        `Object metadata decorator not found, can't parse ${target.name}`,
      );
    }

    const workspaceIndexMetadataArgsCollection =
      metadataArgsStorage.filterIndexes(target);

    return workspaceIndexMetadataArgsCollection.map(
      (workspaceIndexMetadataArgs) => {
        const objectMetadata =
          originalObjectMetadataMap[workspaceEntity.nameSingular];

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
        };

        return indexMetadata;
      },
    );
  }
}
