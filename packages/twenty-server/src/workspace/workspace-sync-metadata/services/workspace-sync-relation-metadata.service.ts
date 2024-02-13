import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { FeatureFlagMap } from 'src/core/feature-flag/interfaces/feature-flag-map.interface';
import { ComparatorAction } from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';
import { WorkspaceMigrationBuilderAction } from 'src/workspace/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { mapObjectMetadataByUniqueIdentifier } from 'src/workspace/workspace-sync-metadata/utils/sync-metadata.util';
import { StandardRelationFactory } from 'src/workspace/workspace-sync-metadata/factories/standard-relation.factory';
import { WorkspaceRelationComparator } from 'src/workspace/workspace-sync-metadata/comparators/workspace-relation.comparator';
import { WorkspaceMetadataUpdaterService } from 'src/workspace/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { WorkspaceSyncStorage } from 'src/workspace/workspace-sync-metadata/storage/workspace-sync.storage';
import { WorkspaceMigrationRelationFactory } from 'src/workspace/workspace-migration-builder/factories/workspace-migration-relation.factory';

@Injectable()
export class WorkspaceSyncRelationMetadataService {
  private readonly logger = new Logger(
    WorkspaceSyncRelationMetadataService.name,
  );

  constructor(
    private readonly standardRelationFactory: StandardRelationFactory,
    private readonly workspaceRelationComparator: WorkspaceRelationComparator,
    private readonly workspaceMetadataUpdaterService: WorkspaceMetadataUpdaterService,
    private readonly workspaceMigrationRelationFactory: WorkspaceMigrationRelationFactory,
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

    // Create map of object metadata & field metadata by unique identifier
    const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection,
    );

    const relationMetadataRepository = manager.getRepository(
      RelationMetadataEntity,
    );

    // Retrieve relation metadata collection from DB
    const originalRelationMetadataCollection =
      await relationMetadataRepository.find({
        where: {
          workspaceId: context.workspaceId,
          fromFieldMetadata: { isCustom: false },
        },
      });

    // Create standard relation metadata collection
    const standardRelationMetadataCollection =
      this.standardRelationFactory.create(
        context,
        originalObjectMetadataMap,
        workspaceFeatureFlagsMap,
      );

    const relationComparatorResults = this.workspaceRelationComparator.compare(
      originalRelationMetadataCollection,
      standardRelationMetadataCollection,
    );

    for (const relationComparatorResult of relationComparatorResults) {
      if (relationComparatorResult.action === ComparatorAction.CREATE) {
        storage.addCreateRelationMetadata(relationComparatorResult.object);
      } else if (relationComparatorResult.action === ComparatorAction.DELETE) {
        storage.addDeleteRelationMetadata(relationComparatorResult.object);
      }
    }

    const metadataRelationUpdaterResult =
      await this.workspaceMetadataUpdaterService.updateRelationMetadata(
        manager,
        storage,
      );

    // Create migrations
    const createRelationWorkspaceMigrations =
      await this.workspaceMigrationRelationFactory.create(
        originalObjectMetadataCollection,
        metadataRelationUpdaterResult.createdRelationMetadataCollection,
        WorkspaceMigrationBuilderAction.CREATE,
      );

    return createRelationWorkspaceMigrations;
  }
}
