import { Module } from '@nestjs/common';

import { WorkspaceMigrationModule } from 'src/metadata/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.module';

import { RunWorkspaceMigrationsCommand } from './run-workspace-migrations.command';

@Module({
  imports: [WorkspaceMigrationModule, WorkspaceMigrationRunnerModule],
  providers: [RunWorkspaceMigrationsCommand],
})
export class WorkspaceMigrationRunnerCommandsModule {}
