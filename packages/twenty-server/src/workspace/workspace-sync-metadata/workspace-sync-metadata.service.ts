import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { FeatureFlagFactory } from 'src/workspace/workspace-sync-metadata/factories/feature-flags.factory';
import { WorkspaceSyncObjectMetadataService } from 'src/workspace/workspace-sync-metadata/services/workspace-sync-object-metadata.service';
import { WorkspaceSyncRelationMetadataService } from 'src/workspace/workspace-sync-metadata/services/workspace-sync-relation-metadata.service';

@Injectable()
export class WorkspaceSyncMetadataService {
  private readonly logger = new Logger(WorkspaceSyncMetadataService.name);

  constructor(
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
  // @Transaction()
  public async syncStandardObjectsAndFieldsMetadata(
    context: WorkspaceSyncContext,
    // // Maybe we can find a better way to inject the manager here
    // @TransactionManager() manager?: EntityManager,
  ) {
    this.logger.log('Syncing standard objects and fields metadata');

    try {
      // Retrieve feature flags
      const workspaceFeatureFlagsMap =
        await this.featureFlagFactory.create(context);

      this.logger.log('Syncing standard objects and fields metadata');

      /**
       * BE CAREFUL !
       * Actually two transactions are created here:
       * one for the sync of the standard objects and fields
       * and one for the migration execution.
       * This is because we need to retrieve the objectMetadata for the relation sync.
       * TODO: We should avoid this, and instead recreated an objectMetadataCollection based
       * on the save command that has been executed.
       * This would allow us to run the migration in the same transaction.
       * And rollback the migration if the sync fails.
       */
      await this.workspaceSyncObjectMetadataService.synchronize(
        context,
        workspaceFeatureFlagsMap,
      );

      await this.workspaceSyncRelationMetadataService.synchronize(
        context,
        workspaceFeatureFlagsMap,
      );

      // Execute migrations
      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        context.workspaceId,
      );
    } catch (error) {
      console.error('Sync of standard objects failed with:', error);
    }
  }
}
