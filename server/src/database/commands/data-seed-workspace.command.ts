import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { seedCompanies } from 'src/database/typeorm-seeds/workspace/companies';
import { seedViewFields } from 'src/database/typeorm-seeds/workspace/view-fields';
import { seedViews } from 'src/database/typeorm-seeds/workspace/views';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { seedMetadataSchema } from 'src/database/typeorm-seeds/metadata';
import { seedOpportunity } from 'src/database/typeorm-seeds/workspace/opportunity';
import { seedPipelineStep } from 'src/database/typeorm-seeds/workspace/pipeline-step';
import { seedWorkspaceMember } from 'src/database/typeorm-seeds/workspace/workspaceMember';
import { seedPeople } from 'src/database/typeorm-seeds/workspace/people';
import { seedCoreSchema } from 'src/database/typeorm-seeds/core';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

// TODO: implement dry-run
@Command({
  name: 'workspace:seed',
  description:
    'Seed workspace with initial data. This command is intended for development only.',
})
export class DataSeedWorkspaceCommand extends CommandRunner {
  workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';

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

      await seedCoreSchema(dataSource);
      await seedMetadataSchema(dataSource);
    } catch (error) {
      console.error(error);
      return;
    }

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
      await this.workspaceMigrationService.insertStandardMigrations(
        this.workspaceId,
      );
      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        this.workspaceId,
      );

      await seedCompanies(workspaceDataSource, dataSourceMetadata.schema);
      await seedPeople(workspaceDataSource, dataSourceMetadata.schema);
      await seedPipelineStep(workspaceDataSource, dataSourceMetadata.schema);
      await seedOpportunity(workspaceDataSource, dataSourceMetadata.schema);

      await seedViews(workspaceDataSource, dataSourceMetadata.schema);
      await seedViewFields(workspaceDataSource, dataSourceMetadata.schema);
      await seedWorkspaceMember(workspaceDataSource, dataSourceMetadata.schema);
    } catch (error) {
      console.error(error);
    }

    await this.typeORMService.disconnectFromDataSource(dataSourceMetadata.id);
  }
}
