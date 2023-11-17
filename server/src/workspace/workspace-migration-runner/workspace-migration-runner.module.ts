import { Module } from '@nestjs/common';

import { WorkspaceMigrationModule } from 'src/metadata/workspace-migration/workspace-migration.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

import { WorkspaceMigrationRunnerService } from './workspace-migration-runner.service';

@Module({
  imports: [WorkspaceDataSourceModule, WorkspaceMigrationModule],
  exports: [WorkspaceMigrationRunnerService],
  providers: [WorkspaceMigrationRunnerService],
})
export class WorkspaceMigrationRunnerModule {}
