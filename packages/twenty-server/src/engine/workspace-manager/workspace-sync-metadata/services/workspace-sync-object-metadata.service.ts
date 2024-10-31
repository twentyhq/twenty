import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';
import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationObjectFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-object.factory';
import { WorkspaceObjectComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-object.comparator';
import { StandardObjectFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-object.factory';
import { WorkspaceMetadataUpdaterService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
import { mapObjectMetadataByUniqueIdentifier } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/sync-metadata.util';

@Injectable()
export class WorkspaceSyncObjectMetadataService {
  private readonly logger = new Logger(WorkspaceSyncObjectMetadataService.name);

  constructor(
    private readonly standardObjectFactory: StandardObjectFactory,
    private readonly workspaceObjectComparator: WorkspaceObjectComparator,
    private readonly workspaceMetadataUpdaterService: WorkspaceMetadataUpdaterService,
    private readonly workspaceMigrationObjectFactory: WorkspaceMigrationObjectFactory,
  ) {}

  async synchronize(
    context: WorkspaceSyncContext,
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const objectMetadataRepository =
      manager.getRepository(ObjectMetadataEntity);

    const relationMetadataRepository = manager.getRepository(
      RelationMetadataEntity,
    );

    // Retrieve object metadata collection from DB
    const originalObjectMetadataCollection =
      await objectMetadataRepository.find({
        where: {
          workspaceId: context.workspaceId,
          fields: { isCustom: false },
        },
        relations: ['dataSource', 'fields'],
      });

    // Retrieve relation metadata collection from DB
    const originalRelationMetadataCollection =
      await relationMetadataRepository.find({
        where: {
          workspaceId: context.workspaceId,
        },
        relations: ['toObjectMetadata', 'toFieldMetadata'],
      });

    const relationMetadataByFromObjectMetadataId: Record<
      string,
      RelationMetadataEntity[]
    > = originalRelationMetadataCollection.reduce(
      (acc, relationMetadata) => {
        const fromObjectMetadataId = relationMetadata.fromObjectMetadataId;

        if (!acc[fromObjectMetadataId]) {
          acc[fromObjectMetadataId] = [];
        }

        acc[fromObjectMetadataId].push(relationMetadata);

        return acc;
      },
      {} as Record<string, RelationMetadataEntity[]>,
    );

    // Create standard object metadata collection
    const standardObjectMetadataCollection = this.standardObjectFactory.create(
      standardObjectMetadataDefinitions,
      context,
      workspaceFeatureFlagsMap,
    );

    // Create map of original and standard object metadata by standard ids
    const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection,
    );
    const standardObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      standardObjectMetadataCollection,
    );

    this.logger.log('Comparing standard objects and fields metadata');

    // Store object that need to be deleted
    for (const originalObjectMetadata of originalObjectMetadataCollection.filter(
      (object) => !object.isCustom,
    )) {
      if (
        originalObjectMetadata.standardId &&
        !standardObjectMetadataMap[originalObjectMetadata.standardId]
      ) {
        storage.addDeleteObjectMetadata(originalObjectMetadata);
      }
    }

    // Loop over all standard objects and compare them with the objects in DB
    for (const standardObjectId in standardObjectMetadataMap) {
      const originalObjectMetadata =
        originalObjectMetadataMap[standardObjectId];
      const standardObjectMetadata =
        standardObjectMetadataMap[standardObjectId];

      /**
       * COMPARE OBJECT METADATA
       */
      const objectComparatorResult = this.workspaceObjectComparator.compare(
        originalObjectMetadata,
        standardObjectMetadata,
      );

      if (objectComparatorResult.action === ComparatorAction.CREATE) {
        storage.addCreateObjectMetadata(standardObjectMetadata);
        continue;
      }

      if (objectComparatorResult.action === ComparatorAction.UPDATE) {
        storage.addUpdateObjectMetadata(objectComparatorResult.object);
      }
    }

    this.logger.log('Updating workspace metadata');

    // Apply changes to DB
    const metadataObjectUpdaterResult =
      await this.workspaceMetadataUpdaterService.updateObjectMetadata(
        manager,
        storage,
      );

    this.logger.log('Generating migrations');

    // Create migrations
    const createObjectWorkspaceMigrations =
      await this.workspaceMigrationObjectFactory.create(
        metadataObjectUpdaterResult.createdObjectMetadataCollection,
        WorkspaceMigrationBuilderAction.CREATE,
      );

    const updateObjectWorkspaceMigrations =
      await this.workspaceMigrationObjectFactory.create(
        metadataObjectUpdaterResult.updatedObjectMetadataCollection,
        WorkspaceMigrationBuilderAction.UPDATE,
      );

    const deleteObjectWorkspaceMigrations =
      await this.workspaceMigrationObjectFactory.create(
        storage.objectMetadataDeleteCollection,
        WorkspaceMigrationBuilderAction.DELETE,
        relationMetadataByFromObjectMetadataId,
      );

    this.logger.log('Saving migrations');

    return [
      ...createObjectWorkspaceMigrations,
      ...updateObjectWorkspaceMigrations,
      ...deleteObjectWorkspaceMigrations,
    ];
  }
}
