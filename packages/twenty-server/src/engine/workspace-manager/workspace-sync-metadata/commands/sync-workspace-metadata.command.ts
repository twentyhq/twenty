import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import isEmpty from 'lodash.isempty';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { isWorkspaceActive } from 'src/database/commands/utils/is-workspace-active.utils';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceHealthService } from 'src/engine/workspace-manager/workspace-health/workspace-health.service';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

import { SyncWorkspaceLoggerService } from './services/sync-workspace-logger.service';

// TODO: implement dry-run
interface BaseOptions {
  dryRun?: boolean;
  force?: boolean;
}

interface WorkspaceIdOption extends BaseOptions {
  workspaceId: string;
  syncAllActiveWorkspaces?: never;
}

interface SyncAllActiveWorkspacesOption extends BaseOptions {
  workspaceId?: never;
  syncAllActiveWorkspaces: boolean;
}

type RunWorkspaceMigrationsOptions =
  | WorkspaceIdOption
  | SyncAllActiveWorkspacesOption;

@Command({
  name: 'workspace:sync-metadata',
  description: 'Sync metadata',
})
export class SyncWorkspaceMetadataCommand extends CommandRunner {
  private readonly logger = new Logger(SyncWorkspaceMetadataCommand.name);

  constructor(
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly workspaceHealthService: WorkspaceHealthService,
    private readonly dataSourceService: DataSourceService,
    private readonly syncWorkspaceLoggerService: SyncWorkspaceLoggerService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: RunWorkspaceMigrationsOptions,
  ): Promise<void> {
    // TODO: re-implement load index from workspaceService, this is breaking the logger
    let workspaceIds = options.workspaceId ? [options.workspaceId] : [];

    if (options.syncAllActiveWorkspaces && isEmpty(workspaceIds)) {
      const workspaces = await this.workspaceRepository.find();

      const activeWorkspaceIds = (
        await Promise.all(
          workspaces.map(async (workspace) => {
            const isActive = await isWorkspaceActive({
              workspace: workspace,
              billingSubscriptionRepository: this.billingSubscriptionRepository,
              featureFlagRepository: this.featureFlagRepository,
            });

            return { workspace, isActive };
          }),
        )
      )
        .filter((result) => result.isActive)
        .map((result) => result.workspace.id);

      workspaceIds = activeWorkspaceIds;
      this.logger.log(
        `Attempting to sync ${activeWorkspaceIds.length} workspaces.`,
      );
    }

    const errorsDuringAllActiveWorkspaceSync: string[] = [];

    for (const workspaceId of workspaceIds) {
      try {
        const issues =
          await this.workspaceHealthService.healthCheck(workspaceId);

        // Security: abort if there are issues.
        if (issues.length > 0) {
          if (!options.force) {
            this.logger.error(
              `Workspace contains ${issues.length} issues, aborting.`,
            );

            this.logger.log(
              'If you want to force the migration, use --force flag',
            );
            this.logger.log(
              'Please use `workspace:health` command to check issues and fix them before running this command.',
            );

            return;
          }

          this.logger.warn(
            `Workspace contains ${issues.length} issues, sync has been forced.`,
          );
        }
      } catch (error) {
        if (!options.force) {
          throw error;
        }

        this.logger.warn(
          `Workspace health check failed with error, but sync has been forced.`,
          error,
        );
      }

      try {
        const dataSourceMetadata =
          await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
            workspaceId,
          );

        const { storage, workspaceMigrations } =
          await this.workspaceSyncMetadataService.synchronize(
            {
              workspaceId,
              dataSourceId: dataSourceMetadata.id,
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
      } catch (error) {
        if (options.syncAllActiveWorkspaces) {
          errorsDuringAllActiveWorkspaceSync.push(
            `Failed to synchronize workspace ${workspaceId}: ${error.message}`,
          );

          continue;
        }
        throw error;
      }
    }

    if (options.syncAllActiveWorkspaces) {
      this.logger.log(
        `Finished synchronizing all active workspaces (${
          workspaceIds.length
        } workspaces). ${
          errorsDuringAllActiveWorkspaceSync.length > 0
            ? 'Errors during sync:\n' +
              errorsDuringAllActiveWorkspaceSync.join('.\n')
            : ''
        }`,
      );
    }
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'Dry run without applying changes',
    required: false,
  })
  dryRun(): boolean {
    return true;
  }

  @Option({
    flags: '-f, --force',
    description: 'Force migration',
    required: false,
  })
  force(): boolean {
    return true;
  }

  @Option({
    flags: '-s, --sync-all-active-workspaces',
    description: 'Sync all active workspaces',
    required: false,
  })
  syncAllActiveWorkspaces(): boolean {
    return true;
  }
}
