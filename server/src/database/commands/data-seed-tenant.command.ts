import { InjectDataSource } from '@nestjs/typeorm';

import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { TenantMigrationRunnerService } from 'src/tenant-migration-runner/tenant-migration-runner.service';
import { seedCompanies } from 'src/database/typeorm-seeds/tenant/companies';
import { seedViewFields } from 'src/database/typeorm-seeds/tenant/view-fields';
import { seedViews } from 'src/database/typeorm-seeds/tenant/views';
import { seedObjectMetadata } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { seedCompanyFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/company';
import { seedViewFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/view';
import { seedViewFieldFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/viewField';
import { seedViewFilterFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/viewFilter';
import { seedViewSortFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/viewSort';
import { seedViewRelationMetadata } from 'src/database/typeorm-seeds/metadata/relation-metadata/view';

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
      await seedObjectMetadata(this.metadataDataSource, 'metadata');

      await seedCompanyFieldMetadata(this.metadataDataSource, 'metadata');
      await seedViewFieldMetadata(this.metadataDataSource, 'metadata');
      await seedViewFieldFieldMetadata(this.metadataDataSource, 'metadata');
      await seedViewSortFieldMetadata(this.metadataDataSource, 'metadata');
      await seedViewFilterFieldMetadata(this.metadataDataSource, 'metadata');

      await seedViewRelationMetadata(this.metadataDataSource, 'metadata');

      await this.tenantMigrationService.insertStandardMigrations(
        this.workspaceId,
      );
      await this.migrationRunnerService.executeMigrationFromPendingMigrations(
        this.workspaceId,
      );

      await seedCompanies(workspaceDataSource, dataSourceMetadata.schema);
      await seedViews(workspaceDataSource, dataSourceMetadata.schema);
      await seedViewFields(workspaceDataSource, dataSourceMetadata.schema);
    } catch (error) {
      console.error(error);
    }

    await this.typeORMService.disconnectFromDataSource(dataSourceMetadata.id);
  }
}
