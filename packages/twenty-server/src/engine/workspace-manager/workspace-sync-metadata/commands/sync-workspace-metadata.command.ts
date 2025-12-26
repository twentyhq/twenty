import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

import { SyncWorkspaceLoggerService } from './services/sync-workspace-logger.service';

@Command({
  name: 'workspace:sync-metadata',
  description: 'Sync metadata',
})
export class SyncWorkspaceMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    protected readonly dataSourceService: DataSourceService,
    private readonly syncWorkspaceLoggerService: SyncWorkspaceLoggerService,
    private readonly featureFlagService: FeatureFlagService,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running workspace sync for workspace: ${workspaceId} (${index} out of ${total})`,
    );

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const featureFlags =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    const { storage, workspaceMigrations } =
      await this.workspaceSyncMetadataService.synchronize(
        {
          workspaceId,
          dataSourceId: dataSourceMetadata.id,
          featureFlags,
        },
        { applyChanges: !options.dryRun },
      );

    if (options.dryRun) {
      await this.syncWorkspaceLoggerService.saveLogs(
        workspaceId,
        storage,
        workspaceMigrations,
      );
    }

    this.logger.log(`Finished synchronizing workspace.`);
  }
}
