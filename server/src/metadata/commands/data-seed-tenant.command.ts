import { InjectDataSource } from '@nestjs/typeorm';

import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';

import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { MigrationRunnerService } from 'src/metadata/migration-runner/migration-runner.service';
import { seedCompanies } from 'src/database/typeorm-seeds/tenant/companies';
import { seedViewFields } from 'src/database/typeorm-seeds/tenant/view-fields';
import { seedViews } from 'src/database/typeorm-seeds/tenant/views';
import { seedFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata';
import { seedObjectMetadata } from 'src/database/typeorm-seeds/metadata/object-metadata';

// TODO: implement dry-run
@Command({
  name: 'tenant:seed',
  description:
    'Seed tenant with initial data. This command is intended for development only.',
})
export class DataSeedTenantCommand extends CommandRunner {
  workspaceId = 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419';

  constructor(
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly dataSourceService: DataSourceService,
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly migrationRunnerService: MigrationRunnerService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const dataSourceMetadata =
      await this.dataSourceMetadataService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        this.workspaceId,
      );

    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(
        this.workspaceId,
      );

    if (!workspaceDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    await seedObjectMetadata(this.metadataDataSource, 'metadata');
    await seedFieldMetadata(this.metadataDataSource, 'metadata');

    await this.tenantMigrationService.insertStandardMigrations(
      this.workspaceId,
    );
    await this.migrationRunnerService.executeMigrationFromPendingMigrations(
      this.workspaceId,
    );

    await seedCompanies(workspaceDataSource, dataSourceMetadata.schema);
    await seedViewFields(workspaceDataSource, dataSourceMetadata.schema);
    await seedViews(workspaceDataSource, dataSourceMetadata.schema);

    await this.dataSourceService.disconnectFromWorkspaceDataSource(
      this.workspaceId,
    );
  }
}
