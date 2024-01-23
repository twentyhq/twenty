import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { FeatureFlagFactory } from 'src/workspace/workspace-sync-metadata/factories/feature-flags.factory';
import { WorkspaceSyncObjectMetadataService } from 'src/workspace/workspace-sync-metadata/services/workspace-sync-object-metadata.service';
import { WorkspaceSyncRelationMetadataService } from 'src/workspace/workspace-sync-metadata/services/workspace-sync-relation-metadata.service';
import { WorkspaceSyncStorage } from 'src/workspace/workspace-sync-metadata/storage/workspace-sync.storage';

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
  ) {}

  /**
   *
   * Sync all standard objects and fields metadata for a given workspace and data source
   * This will update the metadata if it has changed and generate migrations based on the diff.
   *
   * @param dataSourceId
   * @param workspaceId
   */
  public async syncStandardObjectsAndFieldsMetadata(
    context: WorkspaceSyncContext,
  ) {
    this.logger.log('Syncing standard objects and fields metadata');
    const queryRunner = this.metadataDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    try {
      const storage = new WorkspaceSyncStorage();

      // Retrieve feature flags
      const workspaceFeatureFlagsMap =
        await this.featureFlagFactory.create(context);

      this.logger.log('Syncing standard objects and fields metadata');

      await this.workspaceSyncObjectMetadataService.synchronize(
        context,
        manager,
        storage,
        workspaceFeatureFlagsMap,
      );

      await this.workspaceSyncRelationMetadataService.synchronize(
        context,
        manager,
        storage,
        workspaceFeatureFlagsMap,
      );

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
    }
  }
}
