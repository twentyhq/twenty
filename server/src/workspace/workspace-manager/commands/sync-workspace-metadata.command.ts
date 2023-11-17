import { Command, CommandRunner, Option } from 'nest-commander';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { WorkspaceManagerService } from 'src/workspace/workspace-manager/workspace-manager.service';

// TODO: implement dry-run
interface RunWorkspaceMigrationsOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:sync-metadata',
  description: 'Sync metadata',
})
export class SyncWorkspaceMetadataCommand extends CommandRunner {
  constructor(
    private readonly workspaceManagerService: WorkspaceManagerService,
    private readonly dataSourceService: DataSourceService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: RunWorkspaceMigrationsOptions,
  ): Promise<void> {
    // TODO: run in a dedicated job + run queries in a transaction.
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        options.workspaceId,
      );

    // TODO: This solution could be improved, using a diff for example, we should not have to delete all metadata and recreate them.
    await this.workspaceManagerService.resetStandardObjectsAndFieldsMetadata(
      dataSourceMetadata.id,
      options.workspaceId,
    );
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }
}
