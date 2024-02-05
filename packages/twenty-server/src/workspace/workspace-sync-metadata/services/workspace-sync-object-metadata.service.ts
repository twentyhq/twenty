import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { ComparatorAction } from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';
import { FeatureFlagMap } from 'src/core/feature-flag/interfaces/feature-flag-map.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { mapObjectMetadataByUniqueIdentifier } from 'src/workspace/workspace-sync-metadata/utils/sync-metadata.util';
import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { StandardObjectFactory } from 'src/workspace/workspace-sync-metadata/factories/standard-object.factory';
import { WorkspaceObjectComparator } from 'src/workspace/workspace-sync-metadata/comparators/workspace-object.comparator';
import { WorkspaceFieldComparator } from 'src/workspace/workspace-sync-metadata/comparators/workspace-field.comparator';
import { WorkspaceMetadataUpdaterService } from 'src/workspace/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { WorkspaceSyncStorage } from 'src/workspace/workspace-sync-metadata/storage/workspace-sync.storage';
import { ObjectWorkspaceMigrationFactory } from 'src/workspace/workspace-sync-metadata/factories/object-workspace-migration.factory';
import { FieldWorkspaceMigrationFactory } from 'src/workspace/workspace-sync-metadata/factories/field-workspace-migration.factory';

@Injectable()
export class WorkspaceSyncObjectMetadataService {
  private readonly logger = new Logger(WorkspaceSyncObjectMetadataService.name);

  constructor(
    private readonly standardObjectFactory: StandardObjectFactory,
    private readonly workspaceObjectComparator: WorkspaceObjectComparator,
    private readonly workspaceFieldComparator: WorkspaceFieldComparator,
    private readonly workspaceMetadataUpdaterService: WorkspaceMetadataUpdaterService,
    private readonly objectWorkspaceMigrationFactory: ObjectWorkspaceMigrationFactory,
    private readonly fieldWorkspaceMigrationFactory: FieldWorkspaceMigrationFactory,
  ) {}

  async synchronize(
    context: WorkspaceSyncContext,
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const objectMetadataRepository =
      manager.getRepository(ObjectMetadataEntity);

    // Retrieve object metadata collection from DB
    const originalObjectMetadataCollection =
      await objectMetadataRepository.find({
        where: {
          workspaceId: context.workspaceId,
          isCustom: false,
          fields: { isCustom: false },
        },
        relations: ['dataSource', 'fields'],
      });

    // Create standard object metadata collection
    const standardObjectMetadataCollection = this.standardObjectFactory.create(
      context,
      workspaceFeatureFlagsMap,
    );

    // Create map of original and standard object metadata by unique identifier
    const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection,
    );
    const standardObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      standardObjectMetadataCollection,
    );

    this.logger.log('Comparing standard objects and fields metadata');

    // Store object that need to be deleted
    for (const originalObjectMetadata of originalObjectMetadataCollection) {
      if (!standardObjectMetadataMap[originalObjectMetadata.nameSingular]) {
        storage.addDeleteObjectMetadata(originalObjectMetadata);
      }
    }

    // Loop over all standard objects and compare them with the objects in DB
    for (const standardObjectName in standardObjectMetadataMap) {
      const originalObjectMetadata =
        originalObjectMetadataMap[standardObjectName];
      const standardObjectMetadata =
        standardObjectMetadataMap[standardObjectName];

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

      /**
       * COMPARE FIELD METADATA
       */
      const fieldComparatorResults = this.workspaceFieldComparator.compare(
        originalObjectMetadata,
        standardObjectMetadata,
      );

      for (const fieldComparatorResult of fieldComparatorResults) {
        switch (fieldComparatorResult.action) {
          case ComparatorAction.CREATE: {
            storage.addCreateFieldMetadata(fieldComparatorResult.object);
            break;
          }
          case ComparatorAction.UPDATE: {
            storage.addUpdateFieldMetadata(fieldComparatorResult.object);
            break;
          }
          case ComparatorAction.DELETE: {
            storage.addDeleteFieldMetadata(fieldComparatorResult.object);
            break;
          }
        }
      }
    }

    this.logger.log('Updating workspace metadata');

    // Apply changes to DB
    const metadataObjectUpdaterResult =
      await this.workspaceMetadataUpdaterService.updateObjectMetadata(
        manager,
        storage,
      );
    const metadataFieldUpdaterResult =
      await this.workspaceMetadataUpdaterService.updateFieldMetadata(
        manager,
        storage,
      );

    this.logger.log('Generating migrations');

    // Create migrations
    const objectWorkspaceMigrations =
      await this.objectWorkspaceMigrationFactory.create(
        metadataObjectUpdaterResult.createdObjectMetadataCollection,
        storage.objectMetadataDeleteCollection,
      );

    const fieldWorkspaceMigrations =
      await this.fieldWorkspaceMigrationFactory.create(
        originalObjectMetadataCollection,
        metadataFieldUpdaterResult.createdFieldMetadataCollection,
        storage.fieldMetadataDeleteCollection,
      );

    this.logger.log('Saving migrations');

    return [...objectWorkspaceMigrations, ...fieldWorkspaceMigrations];
  }
}
