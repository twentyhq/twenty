import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import {
  deleteCoreSchema,
  seedCoreSchema,
} from 'src/database/typeorm-seeds/core';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { WorkspaceManagerService } from 'src/workspace/workspace-manager/workspace-manager.service';

// TODO: implement dry-run
@Command({
  name: 'workspace:demo',
  description:
    'Seed workspace with demo data. This command is intended for development only.',
})
export class DataSeedDemoWorkspaceCommand extends CommandRunner {
  // TODO: get workspaceId from
  workspaceId = '20202020-1c25-4d02-bf25-6aeccf7e1337';

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceManagerService: WorkspaceManagerService,
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

      await deleteCoreSchema(dataSource, this.workspaceId);
      await this.workspaceManagerService.delete(this.workspaceId);

      await seedCoreSchema(dataSource, this.workspaceId);
      await this.workspaceManagerService.initDemo(this.workspaceId);
    } catch (error) {
      console.error(error);
      return;
    }
  }
}
