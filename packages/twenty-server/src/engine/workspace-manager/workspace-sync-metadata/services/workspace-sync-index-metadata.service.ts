import { Injectable, Logger } from '@nestjs/common';

import { Any, EntityManager } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';
import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationIndexFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-index.factory';
import { WorkspaceIndexComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-index.comparator';
import { StandardIndexFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-index.factory';
import { WorkspaceMetadataUpdaterService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
import { mapObjectMetadataByUniqueIdentifier } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/sync-metadata.util';

@Injectable()
export class WorkspaceSyncIndexMetadataService {
  private readonly logger = new Logger(WorkspaceSyncIndexMetadataService.name);

  constructor(
    private readonly standardIndexFactory: StandardIndexFactory,
    private readonly workspaceIndexComparator: WorkspaceIndexComparator,
    private readonly workspaceMetadataUpdaterService: WorkspaceMetadataUpdaterService,
    private readonly workspaceMigrationIndexFactory: WorkspaceMigrationIndexFactory,
  ) {}

  async synchronize(
    context: WorkspaceSyncContext,
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    this.logger.log('Syncing index metadata');

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
        relations: ['dataSource', 'fields', 'indexMetadatas'],
      });

    // Create map of object metadata & field metadata by unique identifier
    const originalStandardObjectMetadataMap =
      mapObjectMetadataByUniqueIdentifier(
        originalObjectMetadataCollection.filter(
          (objectMetadata) => !objectMetadata.isCustom,
        ),
        // Relation are based on the singular name
        (objectMetadata) => objectMetadata.nameSingular,
      );

    const originalCustomObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection.filter(
        (objectMetadata) => objectMetadata.isCustom,
      ),
      (objectMetadata) => objectMetadata.nameSingular,
    );

    const indexMetadataRepository = manager.getRepository(IndexMetadataEntity);

    const originalIndexMetadataCollection = await indexMetadataRepository.find({
      where: {
        workspaceId: context.workspaceId,
        objectMetadataId: Any(
          Object.values(originalObjectMetadataCollection).map(
            (object) => object.id,
          ),
        ),
        isCustom: false,
      },
      relations: ['indexFieldMetadatas.fieldMetadata'],
    });

    // Generate index metadata from models
    const standardIndexMetadataCollection = this.standardIndexFactory.create(
      standardObjectMetadataDefinitions,
      context,
      originalStandardObjectMetadataMap,
      originalCustomObjectMetadataMap,
      workspaceFeatureFlagsMap,
    );

    const indexComparatorResults = this.workspaceIndexComparator.compare(
      originalIndexMetadataCollection,
      standardIndexMetadataCollection,
    );

    for (const indexComparatorResult of indexComparatorResults) {
      if (indexComparatorResult.action === ComparatorAction.CREATE) {
        storage.addCreateIndexMetadata(indexComparatorResult.object);
      } else if (indexComparatorResult.action === ComparatorAction.DELETE) {
        storage.addDeleteIndexMetadata(indexComparatorResult.object);
      }
    }

    const metadataIndexUpdaterResult =
      await this.workspaceMetadataUpdaterService.updateIndexMetadata(
        manager,
        storage,
        originalObjectMetadataCollection,
      );

    // Create migrations
    const createIndexWorkspaceMigrations =
      await this.workspaceMigrationIndexFactory.create(
        originalObjectMetadataCollection,
        metadataIndexUpdaterResult.createdIndexMetadataCollection,
        WorkspaceMigrationBuilderAction.CREATE,
      );

    const deleteIndexWorkspaceMigrations =
      await this.workspaceMigrationIndexFactory.create(
        originalObjectMetadataCollection,
        storage.indexMetadataDeleteCollection,
        WorkspaceMigrationBuilderAction.DELETE,
      );

    return [
      ...createIndexWorkspaceMigrations,
      ...deleteIndexWorkspaceMigrations,
    ];
  }
}
