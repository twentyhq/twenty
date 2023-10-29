import { Command, CommandRunner, Option } from 'nest-commander';

import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { TenantInitialisationService } from 'src/metadata/tenant-initialisation/tenant-initialisation.service';

// TODO: implement dry-run
interface DataSeedTenantOptions {
  workspaceId: string;
}

@Command({
  name: 'tenant:data-seed',
  description: 'Seed tenant with initial data',
})
export class DataSeedTenantCommand extends CommandRunner {
  constructor(
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly tenantInitialisationService: TenantInitialisationService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: DataSeedTenantOptions,
  ): Promise<void> {
    const dataSourceMetadata =
      await this.dataSourceMetadataService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        options.workspaceId,
      );
    // TODO: run in a dedicated job + run queries in a transaction.
    await this.tenantInitialisationService.prefillWorkspaceWithStandardObjects(
      dataSourceMetadata,
      options.workspaceId,
    );
  }

  // TODO: workspaceId should be optional and we should run migrations for all workspaces
  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }
}
