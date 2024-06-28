import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceFieldComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field.comparator';
import { WorkspaceMetadataUpdaterService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
import { WorkspaceMigrationFieldFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field.factory';
import { StandardFieldFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-field.factory';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { computeStandardObject } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/compute-standard-object.util';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { mapObjectMetadataByUniqueIdentifier } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/sync-metadata.util';
import { StandardObjectFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-object.factory';

@Injectable()
export class WorkspaceSyncFieldMetadataService {
  private readonly logger = new Logger(WorkspaceSyncFieldMetadataService.name);

  constructor(
    private readonly standardFieldFactory: StandardFieldFactory,
    private readonly standardObjectFactory: StandardObjectFactory,
    private readonly workspaceFieldComparator: WorkspaceFieldComparator,
    private readonly workspaceMetadataUpdaterService: WorkspaceMetadataUpdaterService,
    private readonly workspaceMigrationFieldFactory: WorkspaceMigrationFieldFactory,
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
          // We're only interested in standard fields
          fields: { isCustom: false },
        },
        relations: ['dataSource', 'fields'],
      });

    await this.synchronizeStandardObjectFields(
      context,
      originalObjectMetadataCollection,
      storage,
      workspaceFeatureFlagsMap,
    );

    await this.synchronizeCustomObjectFields(
      context,
      originalObjectMetadataCollection,
      storage,
      workspaceFeatureFlagsMap,
    );

    this.logger.log('Updating workspace metadata');

    const metadataFieldUpdaterResult =
      await this.workspaceMetadataUpdaterService.updateFieldMetadata(
        manager,
        storage,
      );

    this.logger.log('Generating migrations');

    const createFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        metadataFieldUpdaterResult.createdFieldMetadataCollection,
        WorkspaceMigrationBuilderAction.CREATE,
      );

    const updateFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        metadataFieldUpdaterResult.updatedFieldMetadataCollection,
        WorkspaceMigrationBuilderAction.UPDATE,
      );

    const deleteFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        storage.fieldMetadataDeleteCollection,
        WorkspaceMigrationBuilderAction.DELETE,
      );

    this.logger.log('Saving migrations');

    return [
      ...createFieldWorkspaceMigrations,
      ...updateFieldWorkspaceMigrations,
      ...deleteFieldWorkspaceMigrations,
    ];
  }

  /**
   * This can be optimized to avoid import of standardObjectFactory here.
   * We should refactor the logic of the factory, so this one only create the objects and not the fields.
   * Then standardFieldFactory should be used to create the fields of standard objects.
   */
  private async synchronizeStandardObjectFields(
    context: WorkspaceSyncContext,
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    storage: WorkspaceSyncStorage,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Promise<void> {
    const customObjectMetadataCollection =
      originalObjectMetadataCollection.filter(
        (objectMetadata) => objectMetadata.isCustom,
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
      const standardObjectMetadata = computeStandardObject(
        standardObjectMetadataMap[standardObjectId],
        originalObjectMetadata,
        customObjectMetadataCollection,
      );

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
  }

  private async synchronizeCustomObjectFields(
    context: WorkspaceSyncContext,
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    storage: WorkspaceSyncStorage,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Promise<void> {
    // Filter out non-custom objects
    const customObjectMetadataCollection =
      originalObjectMetadataCollection.filter(
        (objectMetadata) => objectMetadata.isCustom,
      );

    // Create standard field metadata collection
    const standardFieldMetadataCollection = this.standardFieldFactory.create(
      CustomWorkspaceEntity,
      context,
      workspaceFeatureFlagsMap,
    );

    // Loop over all custom objects from the DB and compare their fields with standard fields
    for (const customObjectMetadata of customObjectMetadataCollection) {
      // Also, maybe it's better to refactor a bit and move generation part into a separate module ?
      const standardObjectMetadata = computeStandardObject(
        {
          ...customObjectMetadata,
          fields: standardFieldMetadataCollection,
        },
        customObjectMetadata,
      );

      /**
       * COMPARE FIELD METADATA
       */
      const fieldComparatorResults = this.workspaceFieldComparator.compare(
        customObjectMetadata,
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
  }
}
