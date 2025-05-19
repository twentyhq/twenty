import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';
import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceMigrationRelationFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-relation.factory';
import { WorkspaceRelationComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-relation.comparator';
import { StandardRelationFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-relation.factory';
import { WorkspaceMetadataUpdaterService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
import { mapObjectMetadataByUniqueIdentifier } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/sync-metadata.util';

@Injectable()
export class WorkspaceSyncRelationMetadataService {
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
    const customObjectMetadataCollection =
      originalObjectMetadataCollection.filter(
        (objectMetadata) => objectMetadata.isCustom,
      );

    // Create map of object metadata & field metadata by unique identifier
    const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection,
      // Relation are based on the singular name
      (objectMetadata) => objectMetadata.nameSingular,
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
        standardObjectMetadataDefinitions,
        context,
        originalObjectMetadataMap,
      );

    const customRelationMetadataCollection =
      this.standardRelationFactory.create(
        customObjectMetadataCollection.map((objectMetadata) => ({
          object: objectMetadata,
          metadata: CustomWorkspaceEntity,
        })),
        context,
        originalObjectMetadataMap,
      );

    const relationComparatorResults = this.workspaceRelationComparator.compare(
      originalRelationMetadataCollection,
      [
        ...standardRelationMetadataCollection,
        ...customRelationMetadataCollection,
      ],
    );

    for (const relationComparatorResult of relationComparatorResults) {
      if (relationComparatorResult.action === ComparatorAction.CREATE) {
        storage.addCreateRelationMetadata(relationComparatorResult.object);
      } else if (relationComparatorResult.action === ComparatorAction.UPDATE) {
        storage.addUpdateRelationMetadata(relationComparatorResult.object);
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

    const updateRelationWorkspaceMigrations =
      await this.workspaceMigrationRelationFactory.create(
        originalObjectMetadataCollection,
        metadataRelationUpdaterResult.updatedRelationMetadataCollection,
        WorkspaceMigrationBuilderAction.UPDATE,
      );

    return [
      ...createRelationWorkspaceMigrations,
      ...updateRelationWorkspaceMigrations,
    ];
  }
}
