import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { FeatureFlagFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/feature-flags.factory';
import { WorkspaceSyncObjectMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-object-metadata.service';
import { WorkspaceSyncRelationMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-relation-metadata.service';
import { WorkspaceSyncFieldMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-field-metadata.service';
import { WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { WorkspaceSyncIndexMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-sync-index-metadata.service';

interface SynchronizeOptions {
  applyChanges?: boolean;
}

@Injectable()
export class WorkspaceSyncMetadataService {
  private readonly logger = new Logger(WorkspaceSyncMetadataService.name);

  constructor(
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    private readonly featureFlagFactory: FeatureFlagFactory,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceSyncObjectMetadataService: WorkspaceSyncObjectMetadataService,
    private readonly workspaceSyncRelationMetadataService: WorkspaceSyncRelationMetadataService,
    private readonly workspaceSyncFieldMetadataService: WorkspaceSyncFieldMetadataService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly workspaceSyncIndexMetadataService: WorkspaceSyncIndexMetadataService,
  ) {}

  /**
   *
   * Sync all standard objects and fields metadata for a given workspace and data source
   * This will update the metadata if it has changed and generate migrations based on the diff.
   *
   * @param dataSourceId
   * @param workspaceId
   */
  public async synchronize(
    context: WorkspaceSyncContext,
    options: SynchronizeOptions = { applyChanges: true },
  ): Promise<{
    workspaceMigrations: WorkspaceMigrationEntity[];
    storage: WorkspaceSyncStorage;
  }> {
    let workspaceMigrations: WorkspaceMigrationEntity[] = [];
    const storage = new WorkspaceSyncStorage();
    const queryRunner = this.metadataDataSource.createQueryRunner();

    this.logger.log('Syncing standard objects and fields metadata');

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    try {
      const workspaceMigrationRepository = manager.getRepository(
        WorkspaceMigrationEntity,
      );

      // Retrieve feature flags
      const workspaceFeatureFlagsMap =
        await this.featureFlagFactory.create(context);

      this.logger.log('Syncing standard objects and fields metadata');

      // 1 - Sync standard objects
      const workspaceObjectMigrations =
        await this.workspaceSyncObjectMetadataService.synchronize(
          context,
          manager,
          storage,
          workspaceFeatureFlagsMap,
        );

      // 2 - Sync standard fields on custom objects
      const workspaceFieldMigrations =
        await this.workspaceSyncFieldMetadataService.synchronize(
          context,
          manager,
          storage,
          workspaceFeatureFlagsMap,
        );

      // 3 - Sync standard relations on standard and custom objects
      const workspaceRelationMigrations =
        await this.workspaceSyncRelationMetadataService.synchronize(
          context,
          manager,
          storage,
          workspaceFeatureFlagsMap,
        );

      // 4 - Sync standard indexes on standard objects
      const workspaceIndexMigrations =
        await this.workspaceSyncIndexMetadataService.synchronize(
          context,
          manager,
          storage,
          workspaceFeatureFlagsMap,
        );

      // Save workspace migrations into the database
      workspaceMigrations = await workspaceMigrationRepository.save([
        ...workspaceObjectMigrations,
        ...workspaceFieldMigrations,
        ...workspaceRelationMigrations,
        ...workspaceIndexMigrations,
      ]);

      // If we're running a dry run, rollback the transaction and do not execute migrations
      if (!options.applyChanges) {
        this.logger.log('Running in dry run mode, rolling back transaction');

        await queryRunner.rollbackTransaction();

        await queryRunner.release();

        return {
          workspaceMigrations,
          storage,
        };
      }

      await queryRunner.commitTransaction();

      // Execute migrations
      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        context.workspaceId,
      );
    } catch (error) {
      console.error('Sync of standard objects failed with:', error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      await this.workspaceCacheVersionService.incrementVersion(
        context.workspaceId,
      );
    }

    return {
      workspaceMigrations,
      storage,
    };
  }
}
