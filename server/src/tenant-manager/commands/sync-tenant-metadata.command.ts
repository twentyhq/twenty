import { Command, CommandRunner, Option } from 'nest-commander';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TenantManagerService } from 'src/tenant-manager/tenant-manager.service';

// TODO: implement dry-run
interface RunTenantMigrationsOptions {
  workspaceId: string;
}

@Command({
  name: 'tenant:sync-metadata',
  description: 'Sync metadata',
})
export class SyncTenantMetadataCommand extends CommandRunner {
  constructor(
    private readonly tenantManagerService: TenantManagerService,
    private readonly dataSourceService: DataSourceService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: RunTenantMigrationsOptions,
  ): Promise<void> {
    // TODO: run in a dedicated job + run queries in a transaction.
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        options.workspaceId,
      );

    // TODO: This solution could be improved, using a diff for example, we should not have to delete all metadata and recreate them.
    await this.tenantManagerService.resetStandardObjectsAndFieldsMetadata(
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
