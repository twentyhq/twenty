import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';
import {
  ComparatorAction,
  FieldRelationComparatorResult,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { ComputedPartialFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceMigrationFieldFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field.factory';
import { WorkspaceFieldRelationComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field-relation.comparator';
import { StandardFieldRelationFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-field-relation.factory';
import { WorkspaceMetadataUpdaterService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
import { mapObjectMetadataByUniqueIdentifier } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/sync-metadata.util';

@Injectable()
export class WorkspaceSyncFieldMetadataRelationService {
  private readonly logger = new Logger(
    WorkspaceSyncFieldMetadataRelationService.name,
  );

  constructor(
    private readonly standardFieldRelationFactory: StandardFieldRelationFactory,
    private readonly workspaceFieldRelationComparator: WorkspaceFieldRelationComparator,
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
        },
        relations: ['dataSource', 'fields'],
      });

    // Create map of object metadata & field metadata by unique identifier
    const originalObjectMetadataMapByName = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection,
      // Relation are based on the singular name
      (objectMetadata) => objectMetadata.nameSingular,
    );

    await this.synchronizeStandardObjectRelationFields(
      context,
      originalObjectMetadataCollection,
      originalObjectMetadataMapByName,
      storage,
    );

    await this.synchronizeCustomObjectRelationFields(
      context,
      originalObjectMetadataCollection,
      originalObjectMetadataMapByName,
      storage,
    );

    this.logger.log('Updating workspace metadata');

    const metadataFieldUpdaterResult =
      await this.workspaceMetadataUpdaterService.updateFieldMetadata(
        manager,
        storage,
      );

    this.logger.log('Generating migrations');

    const updateFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        metadataFieldUpdaterResult.updatedFieldMetadataCollection,
        WorkspaceMigrationBuilderAction.UPDATE,
      );

    this.logger.log('Saving migrations');

    return [...updateFieldWorkspaceMigrations];
  }

  private async synchronizeStandardObjectRelationFields(
    context: WorkspaceSyncContext,
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    originalObjectMetadataMapByName: Record<string, ObjectMetadataEntity>,
    storage: WorkspaceSyncStorage,
  ): Promise<void> {
    // Create standard field metadata map
    const standardFieldMetadataRelationCollection =
      this.standardFieldRelationFactory.create(
        standardObjectMetadataDefinitions,
        context,
        originalObjectMetadataMapByName,
      );

    // Create map of original and standard object metadata by standard ids
    const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection,
    );

    // Loop over all standard objects and compare them with the objects in DB
    for (const [
      standardObjectId,
      standardFieldMetadataCollection,
    ] of standardFieldMetadataRelationCollection) {
      const originalObjectMetadata =
        originalObjectMetadataMap[standardObjectId];

      const fieldComparatorResults =
        this.workspaceFieldRelationComparator.compare(
          originalObjectMetadata.fields,
          standardFieldMetadataCollection,
        );

      this.storeComparatorResults(fieldComparatorResults, storage);
    }
  }

  private async synchronizeCustomObjectRelationFields(
    context: WorkspaceSyncContext,
    customObjectMetadataCollection: ObjectMetadataEntity[],
    originalObjectMetadataMapByName: Record<string, ObjectMetadataEntity>,
    storage: WorkspaceSyncStorage,
  ): Promise<void> {
    // Create standard field metadata collection
    const customFieldMetadataRelationCollection =
      this.standardFieldRelationFactory.create(
        customObjectMetadataCollection.map((objectMetadata) => ({
          object: objectMetadata,
          metadata: CustomWorkspaceEntity,
        })),
        context,
        originalObjectMetadataMapByName,
      );

    // Loop over all custom objects from the DB and compare their fields with standard fields
    for (const customObjectMetadata of customObjectMetadataCollection) {
      /**
       * COMPARE FIELD METADATA
       */
      const fieldComparatorResults =
        this.workspaceFieldRelationComparator.compare(
          customObjectMetadata.fields,
          customFieldMetadataRelationCollection,
        );

      this.storeComparatorResults(fieldComparatorResults, storage);
    }
  }

  private storeComparatorResults(
    fieldComparatorResults: FieldRelationComparatorResult[],
    storage: WorkspaceSyncStorage,
  ): void {
    for (const fieldComparatorResult of fieldComparatorResults) {
      switch (fieldComparatorResult.action) {
        case ComparatorAction.UPDATE: {
          storage.addUpdateFieldMetadata(
            fieldComparatorResult.object as Partial<ComputedPartialFieldMetadata> & {
              id: string;
            },
          );
          break;
        }
      }
    }
  }
}
