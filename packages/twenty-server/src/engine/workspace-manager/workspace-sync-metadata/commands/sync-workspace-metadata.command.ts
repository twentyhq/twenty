import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';
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
    private readonly dataSourceService: DataSourceService,
    private readonly syncWorkspaceLoggerService: SyncWorkspaceLoggerService,
    private readonly featureFlagService: FeatureFlagService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly applicationService: ApplicationService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
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

    const twentyStandardApplication =
      await this.applicationService.findByUniversalIdentifier({
        workspaceId,
        universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      });

    if (!isDefined(twentyStandardApplication)) {
      throw new Error('Failed to find twenty standard application');
    }

    const { storage, workspaceMigrations } =
      await this.workspaceSyncMetadataService.synchronize(
        {
          workspaceId,
          dataSourceId: dataSourceMetadata.id,
          featureFlags,
          twentyStandardApplication,
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
