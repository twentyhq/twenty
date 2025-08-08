import { Injectable, Logger } from '@nestjs/common';

import { type EntityManager } from 'typeorm';

import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';
import {
  ComparatorAction,
  type FieldComparatorResult,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceMigrationFieldFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field.factory';
import { WorkspaceFieldComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field.comparator';
import { StandardFieldFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-field.factory';
import { WorkspaceMetadataUpdaterService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { type WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
import { computeStandardFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/compute-standard-fields.util';
import { mapObjectMetadataByUniqueIdentifier } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/sync-metadata.util';

@Injectable()
export class WorkspaceSyncFieldMetadataService {
  private readonly logger = new Logger(WorkspaceSyncFieldMetadataService.name);

  constructor(
    private readonly standardFieldFactory: StandardFieldFactory,
    private readonly workspaceFieldComparator: WorkspaceFieldComparator,
    private readonly workspaceMetadataUpdaterService: WorkspaceMetadataUpdaterService,
    private readonly workspaceMigrationFieldFactory: WorkspaceMigrationFieldFactory,
  ) {}

  async synchronize(
    context: WorkspaceSyncContext,
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const objectMetadataRepository =
      manager.getRepository(ObjectMetadataEntity);

    // Retrieve object metadata collection from DB
    const originalObjectMetadataCollection =
      await objectMetadataRepository.find({
        where: {
          workspaceId: context.workspaceId,
          // We're only interested in standard fields
        },
        relations: ['dataSource', 'fields'],
      });
    const customObjectMetadataCollection =
      originalObjectMetadataCollection.filter(
        (objectMetadata) => objectMetadata.isCustom,
      );

    await this.synchronizeStandardObjectFields(
      context,
      originalObjectMetadataCollection,
      customObjectMetadataCollection,
      storage,
    );

    await this.synchronizeCustomObjectFields(
      context,
      customObjectMetadataCollection,
      storage,
    );

    this.logger.log('Updating workspace metadata');

    const metadataFieldUpdaterResult =
      await this.workspaceMetadataUpdaterService.updateFieldMetadata(
        manager,
        storage,
      );

    this.logger.log('Generating migrations');

    const deleteFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        storage.fieldMetadataDeleteCollection,
        WorkspaceMigrationBuilderAction.DELETE,
      );

    const updateFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        metadataFieldUpdaterResult.updatedFieldMetadataCollection,
        WorkspaceMigrationBuilderAction.UPDATE,
      );

    const createFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        metadataFieldUpdaterResult.createdFieldMetadataCollection,
        WorkspaceMigrationBuilderAction.CREATE,
      );

    this.logger.log('Saving migrations');

    return [
      ...deleteFieldWorkspaceMigrations,
      ...updateFieldWorkspaceMigrations,
      ...createFieldWorkspaceMigrations,
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
    customObjectMetadataCollection: ObjectMetadataEntity[],
    storage: WorkspaceSyncStorage,
  ): Promise<void> {
    // Create standard field metadata map
    const standardObjectStandardFieldMetadataMap =
      this.standardFieldFactory.create(
        standardObjectMetadataDefinitions,
        context,
      );

    // Create map of original and standard object metadata by standard ids
    const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection,
    );

    // Loop over all standard objects and compare them with the objects in DB
    for (const [
      standardObjectId,
      standardFieldMetadataCollection,
    ] of standardObjectStandardFieldMetadataMap) {
      const originalObjectMetadata =
        originalObjectMetadataMap[standardObjectId];

      const computedStandardFieldMetadataCollection = computeStandardFields(
        context,
        standardFieldMetadataCollection,
        originalObjectMetadata,
        // We need to provide this for generated relations with custom objects
        customObjectMetadataCollection,
      );

      const fieldComparatorResults = this.workspaceFieldComparator.compare(
        originalObjectMetadata.id,
        originalObjectMetadata.fields,
        computedStandardFieldMetadataCollection,
      );

      this.storeComparatorResults(fieldComparatorResults, storage);
    }
  }

  synchronizeCustomObject(
    context: WorkspaceSyncContext,
    customObjectMetadata: ObjectMetadataEntity,
  ): FieldComparatorResult[] {
    // Create standard field metadata collection
    const customObjectStandardFieldMetadataCollection =
      this.standardFieldFactory.create(CustomWorkspaceEntity, context);

    const standardFieldMetadataCollection = computeStandardFields(
      context,
      customObjectStandardFieldMetadataCollection,
      customObjectMetadata,
    );

    /**
     * COMPARE FIELD METADATA
     */
    const fieldComparatorResults = this.workspaceFieldComparator.compare(
      customObjectMetadata.id,
      customObjectMetadata.fields,
      standardFieldMetadataCollection,
    );

    return fieldComparatorResults;
  }

  private async synchronizeCustomObjectFields(
    context: WorkspaceSyncContext,
    customObjectMetadataCollection: ObjectMetadataEntity[],
    storage: WorkspaceSyncStorage,
  ): Promise<void> {
    // Create standard field metadata collection
    const customObjectStandardFieldMetadataCollection =
      this.standardFieldFactory.create(CustomWorkspaceEntity, context);

    // Loop over all custom objects from the DB and compare their fields with standard fields
    for (const customObjectMetadata of customObjectMetadataCollection) {
      // Also, maybe it's better to refactor a bit and move generation part into a separate module ?
      const standardFieldMetadataCollection = computeStandardFields(
        context,
        customObjectStandardFieldMetadataCollection,
        customObjectMetadata,
      );

      /**
       * COMPARE FIELD METADATA
       */
      const fieldComparatorResults = this.workspaceFieldComparator.compare(
        customObjectMetadata.id,
        customObjectMetadata.fields,
        standardFieldMetadataCollection,
      );

      this.storeComparatorResults(fieldComparatorResults, storage);
    }
  }

  private storeComparatorResults(
    fieldComparatorResults: FieldComparatorResult[],
    storage: WorkspaceSyncStorage,
  ): void {
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
