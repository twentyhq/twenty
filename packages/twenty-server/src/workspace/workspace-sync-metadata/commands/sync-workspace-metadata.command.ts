import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { WorkspaceSyncMetadataService } from 'src/workspace/workspace-sync-metadata/workspace-sync-metadata.service';
import { WorkspaceHealthService } from 'src/workspace/workspace-health/workspace-health.service';

import { SyncWorkspaceLoggerService } from './services/sync-workspace-logger.service';

// TODO: implement dry-run
interface RunWorkspaceMigrationsOptions {
  workspaceId: string;
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
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: RunWorkspaceMigrationsOptions,
  ): Promise<void> {
    const issues = await this.workspaceHealthService.healthCheck(
      options.workspaceId,
    );

    // Security: abort if there are issues.
    if (issues.length > 0) {
      if (!options.force) {
        this.logger.error(
          `Workspace contains ${issues.length} issues, aborting.`,
        );

        this.logger.log('If you want to force the migration, use --force flag');
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
        options.workspaceId,
      );

    const { storage, workspaceMigrations } =
      await this.workspaceSyncMetadataService.syncStandardObjectsAndFieldsMetadata(
        {
          workspaceId: options.workspaceId,
          dataSourceId: dataSourceMetadata.id,
        },
        { applyChanges: !options.dryRun },
      );

    if (options.dryRun) {
      await this.syncWorkspaceLoggerService.saveLogs(
        storage,
        workspaceMigrations,
      );
    }
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
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
