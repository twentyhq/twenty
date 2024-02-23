import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { ComparatorAction } from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';
import { FeatureFlagMap } from 'src/core/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceMigrationBuilderAction } from 'src/workspace/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { WorkspaceFieldComparator } from 'src/workspace/workspace-sync-metadata/comparators/workspace-field.comparator';
import { WorkspaceMetadataUpdaterService } from 'src/workspace/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { WorkspaceSyncStorage } from 'src/workspace/workspace-sync-metadata/storage/workspace-sync.storage';
import { WorkspaceMigrationFieldFactory } from 'src/workspace/workspace-migration-builder/factories/workspace-migration-field.factory';
import { StandardFieldFactory } from 'src/workspace/workspace-sync-metadata/factories/standard-field.factory';
import { CustomObjectStandardFields } from 'src/workspace/workspace-sync-metadata/custom-objects/custom-standard-fields.object-metadata';
import { computeStandardObject } from 'src/workspace/workspace-sync-metadata/utils/compute-standard-object.util';

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
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const objectMetadataRepository =
      manager.getRepository(ObjectMetadataEntity);

    // Retrieve object metadata collection from DB
    const originalObjectMetadataCollection =
      await objectMetadataRepository.find({
        where: {
          workspaceId: context.workspaceId,
          isCustom: true,
          fields: { isCustom: false },
        },
        relations: ['dataSource', 'fields'],
      });

    // Create standard object metadata collection
    const standardFieldMetadataCollection = this.standardFieldFactory.create(
      CustomObjectStandardFields,
      context,
      workspaceFeatureFlagsMap,
    );

    // Loop over all standard objects and compare them with the objects in DB
    for (const originalObjectMetadata of originalObjectMetadataCollection) {
      const standardObjectMetadata = computeStandardObject(
        {
          ...originalObjectMetadata,
          fields: standardFieldMetadataCollection,
        },
        originalObjectMetadata,
      );

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
}
