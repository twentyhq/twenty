import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';
import { WorkspaceHealthService } from 'src/engine/workspace-manager/workspace-health/workspace-health.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

import { SyncWorkspaceLoggerService } from './services/sync-workspace-logger.service';

// TODO: implement dry-run
interface RunWorkspaceMigrationsOptions {
  workspaceId?: string;
  dryRun?: boolean;
  force?: boolean;
}

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
    private readonly workspaceService: WorkspaceService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: RunWorkspaceMigrationsOptions,
  ): Promise<void> {
    const workspaceIds = options.workspaceId
      ? [options.workspaceId]
      : await this.workspaceService.getWorkspaceIds();

    for (const workspaceId of workspaceIds) {
      const issues = await this.workspaceHealthService.healthCheck(workspaceId);

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
}
