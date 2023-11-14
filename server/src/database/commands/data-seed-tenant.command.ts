import { InjectDataSource } from '@nestjs/typeorm';

import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { TenantMigrationRunnerService } from 'src/tenant-migration-runner/tenant-migration-runner.service';
import { seedCompanies } from 'src/database/typeorm-seeds/tenant/companies';
import { seedViewFields } from 'src/database/typeorm-seeds/tenant/view-fields';
import { seedViews } from 'src/database/typeorm-seeds/tenant/views';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { seedMetadataSchema } from 'src/database/typeorm-seeds/metadata';
import { seedWorkspaceMember } from 'src/database/typeorm-seeds/tenant/workspaceMember';

// TODO: implement dry-run
@Command({
  name: 'tenant:seed',
  description:
    'Seed tenant with initial data. This command is intended for development only.',
})
export class DataSeedTenantCommand extends CommandRunner {
  workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';

  constructor(
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly migrationRunnerService: TenantMigrationRunnerService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        this.workspaceId,
      );

    const workspaceDataSource = await this.typeORMService.connectToDataSource(
      dataSourceMetadata,
    );

    if (!workspaceDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    try {
      await seedMetadataSchema(workspaceDataSource, 'metadata');

      await this.tenantMigrationService.insertStandardMigrations(
        this.workspaceId,
      );
      await this.migrationRunnerService.executeMigrationFromPendingMigrations(
        this.workspaceId,
      );

      await seedCompanies(workspaceDataSource, dataSourceMetadata.schema);
      await seedViews(workspaceDataSource, dataSourceMetadata.schema);
      await seedViewFields(workspaceDataSource, dataSourceMetadata.schema);
      await seedWorkspaceMember(workspaceDataSource, dataSourceMetadata.schema);
    } catch (error) {
      console.error(error);
    }

    await this.typeORMService.disconnectFromDataSource(dataSourceMetadata.id);
  }
}
