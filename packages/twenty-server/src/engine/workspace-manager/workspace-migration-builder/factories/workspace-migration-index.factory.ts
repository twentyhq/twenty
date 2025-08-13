import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import {
  createIndexMigration,
  deleteIndexMigration,
} from 'src/engine/workspace-manager/workspace-migration-builder/factories/utils/workspace-migration-index.factory.utils';

@Injectable()
export class WorkspaceMigrationIndexFactory {
  constructor() {}

  async create(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    indexMetadataCollection: IndexMetadataEntity[],
    action: WorkspaceMigrationBuilderAction,
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const originalObjectMetadataMap = Object.fromEntries(
      originalObjectMetadataCollection.map((obj) => [obj.id, obj]),
    );

    const indexMetadataByObjectMetadataMap = new Map<
      ObjectMetadataEntity,
      IndexMetadataEntity[]
    >();

    indexMetadataCollection.forEach((currentIndexMetadata) => {
      const objectMetadata =
        originalObjectMetadataMap[currentIndexMetadata.objectMetadataId];

      if (!objectMetadata) {
        throw new Error(
          `Object metadata with id ${currentIndexMetadata.objectMetadataId} not found`,
        );
      }

      if (!indexMetadataByObjectMetadataMap.has(objectMetadata)) {
        indexMetadataByObjectMetadataMap.set(objectMetadata, []);
      }

      indexMetadataByObjectMetadataMap
        ?.get(objectMetadata)
        ?.push(currentIndexMetadata);
    });

    switch (action) {
      case WorkspaceMigrationBuilderAction.CREATE:
        return createIndexMigration(indexMetadataByObjectMetadataMap);
      case WorkspaceMigrationBuilderAction.DELETE:
        return deleteIndexMigration(indexMetadataByObjectMetadataMap);
      default:
        return [];
    }
  }
}
