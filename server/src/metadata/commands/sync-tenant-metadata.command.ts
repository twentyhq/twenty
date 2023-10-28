import { Command, CommandRunner, Option } from 'nest-commander';

import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';
import { TenantInitialisationService } from 'src/metadata/tenant-initialisation/tenant-initialisation.service';
import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';

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
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly tenantInitialisationService: TenantInitialisationService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: RunTenantMigrationsOptions,
  ): Promise<void> {
    // TODO: run in a dedicated job + run queries in a transaction.
    const dataSourceMetadata =
      await this.dataSourceMetadataService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        options.workspaceId,
      );

    // TODO: This solution could be improved, using a diff for example, we should not have to delete all metadata and recreate them.
    await this.objectMetadataService.deleteMany({
      workspaceId: { eq: options.workspaceId },
    });

    // TODO: this should not be the responsibility of tenantInitialisationService.
    await this.tenantInitialisationService.createObjectsAndFieldsMetadata(
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
