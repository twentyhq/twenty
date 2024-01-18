import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { PartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { PartialObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { MappedObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/mapped-metadata.interface';
import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { ComparatorAction } from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';
import { FeatureFlagMap } from 'src/core/feature-flag/interfaces/feature-flag-map.interface';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { mapObjectMetadataByUniqueIdentifier } from 'src/workspace/workspace-sync-metadata/utils/sync-metadata.util';
import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { StandardObjectFactory } from 'src/workspace/workspace-sync-metadata/factories/standard-object.factory';
import { WorkspaceObjectComparator } from 'src/workspace/workspace-sync-metadata/comparators/workspace-object.comparator';
import { WorkspaceFieldComparator } from 'src/workspace/workspace-sync-metadata/comparators/workspace-field.comparator';
import { WorkspaceMetadataUpdaterService } from 'src/workspace/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { WorkspaceSyncFactory } from 'src/workspace/workspace-sync-metadata/factories/workspace-sync.factory';

@Injectable()
export class WorkspaceSyncObjectMetadataService {
  private readonly logger = new Logger(WorkspaceSyncObjectMetadataService.name);

  constructor(
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    private readonly standardObjectFactory: StandardObjectFactory,
    private readonly workspaceObjectComparator: WorkspaceObjectComparator,
    private readonly workspaceFieldComparator: WorkspaceFieldComparator,
    private readonly workspaceMetadataUpdaterService: WorkspaceMetadataUpdaterService,
    private readonly workspaceSyncFactory: WorkspaceSyncFactory,
  ) {}

  async synchronize(
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Promise<void> {
    const queryRunner = this.metadataDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    try {
      const objectMetadataRepository =
        manager.getRepository(ObjectMetadataEntity);
      const workspaceMigrationRepository = manager.getRepository(
        WorkspaceMigrationEntity,
      );

      // Retrieve object metadata collection from DB
      const originalObjectMetadataCollection =
        await objectMetadataRepository.find({
          where: { workspaceId: context.workspaceId, isCustom: false },
          relations: ['dataSource', 'fields'],
        });

      // Create standard object metadata collection
      const standardObjectMetadataCollection =
        await this.standardObjectFactory.create(
          context,
          workspaceFeatureFlagsMap,
        );

      // Create map of original and standard object metadata by unique identifier
      const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier<
        ObjectMetadataEntity,
        FieldMetadataEntity
      >(originalObjectMetadataCollection);
      const standardObjectMetadataMap = mapObjectMetadataByUniqueIdentifier<
        PartialObjectMetadata,
        PartialFieldMetadata
      >(standardObjectMetadataCollection);

      // Store object metadata by action
      const objectMetadataCreateCollection: MappedObjectMetadata[] = [];
      const objectMetadataUpdateCollection: Partial<ObjectMetadataEntity>[] =
        [];
      const objectMetadataDeleteCollection =
        originalObjectMetadataCollection.filter(
          (originalObjectMetadata) =>
            !standardObjectMetadataMap[originalObjectMetadata.nameSingular],
        );

      // Store field metadata by action
      const fieldMetadataCreateCollection: PartialFieldMetadata[] = [];
      const fieldMetadataUpdateCollection: Partial<FieldMetadataEntity>[] = [];
      const fieldMetadataDeleteCollection: FieldMetadataEntity[] = [];

      this.logger.log('Comparing standard objects and fields metadata');

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
          objectMetadataCreateCollection.push(standardObjectMetadata);
          continue;
        }

        if (objectComparatorResult.action === ComparatorAction.UPDATE) {
          objectMetadataUpdateCollection.push(objectComparatorResult.object);
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
              fieldMetadataCreateCollection.push(fieldComparatorResult.object);
              break;
            }
            case ComparatorAction.UPDATE: {
              fieldMetadataUpdateCollection.push(fieldComparatorResult.object);
              break;
            }
            case ComparatorAction.DELETE: {
              fieldMetadataDeleteCollection.push(fieldComparatorResult.object);
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
          {
            objectMetadataCreateCollection,
            objectMetadataUpdateCollection,
            objectMetadataDeleteCollection,
          },
        );
      const metadataFieldUpdaterResult =
        await this.workspaceMetadataUpdaterService.updateFieldMetadata(
          manager,
          {
            fieldMetadataCreateCollection,
            fieldMetadataUpdateCollection,
            fieldMetadataDeleteCollection,
          },
        );

      this.logger.log('Generating migrations');

      // Create migrations
      const workspaceObjectMigrations =
        await this.workspaceSyncFactory.createObjectMigration(
          originalObjectMetadataCollection,
          metadataObjectUpdaterResult.createdObjectMetadataCollection,
          objectMetadataDeleteCollection,
          metadataFieldUpdaterResult.createdFieldMetadataCollection,
          fieldMetadataDeleteCollection,
        );

      this.logger.log('Saving migrations');

      // Save migrations into DB
      await workspaceMigrationRepository.save(workspaceObjectMigrations);

      // Commit transaction to DB
      await queryRunner.commitTransaction();
    } catch (err) {
      console.error('Sync of object metadata failed with:', err);
      queryRunner.rollbackTransaction();
    } finally {
      queryRunner.release();
    }
  }
}
