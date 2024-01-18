import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { FeatureFlagMap } from 'src/core/feature-flag/interfaces/feature-flag-map.interface';
import { ComparatorAction } from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { mapObjectMetadataByUniqueIdentifier } from 'src/workspace/workspace-sync-metadata/utils/sync-metadata.util';
import { StandardRelationFactory } from 'src/workspace/workspace-sync-metadata/factories/standard-relation.factory';
import { WorkspaceRelationComparator } from 'src/workspace/workspace-sync-metadata/comparators/workspace-relation.comparator';
import { WorkspaceMetadataUpdaterService } from 'src/workspace/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { WorkspaceSyncFactory } from 'src/workspace/workspace-sync-metadata/factories/workspace-sync.factory';
import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';

@Injectable()
export class WorkspaceSyncRelationMetadataService {
  private readonly logger = new Logger(
    WorkspaceSyncRelationMetadataService.name,
  );

  constructor(
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    private readonly standardRelationFactory: StandardRelationFactory,
    private readonly workspaceRelationComparator: WorkspaceRelationComparator,
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

      // Create map of object metadata & field metadata by unique identifier
      const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier<
        ObjectMetadataEntity,
        FieldMetadataEntity
      >(originalObjectMetadataCollection);

      const relationMetadataRepository = manager.getRepository(
        RelationMetadataEntity,
      );

      const relationMetadataCreateCollection: Partial<RelationMetadataEntity>[] =
        [];
      const relationMetadataDeleteCollection: RelationMetadataEntity[] = [];

      // Retrieve relation metadata collection from DB
      // TODO: filter out custom relations once isCustom has been added to relationMetadata table
      const originalRelationMetadataCollection =
        await relationMetadataRepository.find({
          where: { workspaceId: context.workspaceId },
        });

      // Create standard relation metadata collection
      const standardRelationMetadataCollection =
        this.standardRelationFactory.create(
          context,
          originalObjectMetadataMap,
          workspaceFeatureFlagsMap,
        );

      const relationComparatorResults =
        this.workspaceRelationComparator.compare(
          originalRelationMetadataCollection,
          standardRelationMetadataCollection,
        );

      for (const relationComparatorResult of relationComparatorResults) {
        if (relationComparatorResult.action === ComparatorAction.CREATE) {
          relationMetadataCreateCollection.push(
            relationComparatorResult.object,
          );
        } else if (
          relationComparatorResult.action === ComparatorAction.DELETE
        ) {
          relationMetadataDeleteCollection.push(
            relationComparatorResult.object,
          );
        }
      }

      const metadataRelationUpdaterResult =
        await this.workspaceMetadataUpdaterService.updateRelationMetadata(
          manager,
          {
            relationMetadataCreateCollection,
            relationMetadataDeleteCollection,
          },
        );

      // Create migrations
      const workspaceRelationMigrations =
        await this.workspaceSyncFactory.createRelationMigration(
          originalObjectMetadataCollection,
          metadataRelationUpdaterResult.createdRelationMetadataCollection,
          relationMetadataDeleteCollection,
        );

      // Save migrations into DB
      await workspaceMigrationRepository.save(workspaceRelationMigrations);

      // Commit transaction to DB
      await queryRunner.commitTransaction();
    } catch (err) {
      console.error('Sync of relation metadata failed with:', err);
      queryRunner.rollbackTransaction();
    } finally {
      queryRunner.release();
    }
  }
}
