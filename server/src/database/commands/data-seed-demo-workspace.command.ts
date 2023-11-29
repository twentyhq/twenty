import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { seedMetadataSchema } from 'src/database/typeorm-seeds/metadata';
import { seedCoreSchema } from 'src/database/typeorm-seeds/core';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

// TODO: implement dry-run
@Command({
  name: 'workspace:demo',
  description:
    'Seed workspace with initial data. This command is intended for development only.',
})
export class DataSeedDemoWorkspaceCommand extends CommandRunner {
  // TODO: get workspaceId from .env
  workspaceId = '20202020-1c25-4d02-bf25-6aeccf7e1337';
  dataSourceId = '20202020-7f63-47a9-b1b3-6c7290ca1337';
  workspaceSchemaName = 'workspace_1wgvd1injqtife6y4rvfb1337';

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      const dataSource = new DataSource({
        url: this.environmentService.getPGDatabaseUrl(),
        type: 'postgres',
        logging: true,
        schema: 'public',
      });
      await dataSource.initialize();

      await seedCoreSchema(dataSource, this.workspaceId);
      await seedMetadataSchema(
        dataSource,
        this.workspaceId,
        this.dataSourceId,
        this.workspaceSchemaName,
      );
    } catch (error) {
      console.error(error);
      return;
    }

    // const dataSourceMetadata =
    //   await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
    //     this.workspaceId,
    //   );
    // console.log('dataSourceMetadata: ', dataSourceMetadata);
    // const workspaceDataSource = await this.typeORMService.connectToDataSource(
    //   dataSourceMetadata,
    // );

    // if (!workspaceDataSource) {
    //   throw new Error('Could not connect to workspace data source');
    // }

    // try {
    //   await this.workspaceMigrationService.insertStandardMigrations(
    //     this.workspaceId,
    //   );
    //   await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
    //     this.workspaceId,
    //   );

    //   await seedCompanies(workspaceDataSource, dataSourceMetadata.schema);
    //   await seedPeople(workspaceDataSource, dataSourceMetadata.schema);
    //   await seedPipelineStep(workspaceDataSource, dataSourceMetadata.schema);
    //   await seedOpportunity(workspaceDataSource, dataSourceMetadata.schema);

    //   await seedViews(workspaceDataSource, dataSourceMetadata.schema);
    //   await seedViewFields(workspaceDataSource, dataSourceMetadata.schema);
    //   await seedWorkspaceMember(workspaceDataSource, dataSourceMetadata.schema);
    // } catch (error) {
    //   console.error(error);
    // }

    // await this.typeORMService.disconnectFromDataSource(dataSourceMetadata.id);
  }
}
