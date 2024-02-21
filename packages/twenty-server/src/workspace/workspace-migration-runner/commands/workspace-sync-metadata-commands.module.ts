import { Module } from '@nestjs/common';

import { WorkspaceMigrationRunnerModule } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.module';

import { WorkspaceExecutePendingMigrationsCommand } from './workspace-execute-pending-migrations.command';

@Module({
  imports: [WorkspaceMigrationRunnerModule],
  providers: [WorkspaceExecutePendingMigrationsCommand],
})
export class WorkspaceMigrationRunnerCommandsModule {}
