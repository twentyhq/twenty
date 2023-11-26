import { Module } from '@nestjs/common';

import { WorkspaceMigrationModule } from 'src/metadata/workspace-migration/workspace-migration.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { WorkspaceCacheVersionModule } from 'src/metadata/workspace-cache-version/workspace-cache-version.module';

import { WorkspaceMigrationRunnerService } from './workspace-migration-runner.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    WorkspaceMigrationModule,
    WorkspaceCacheVersionModule,
  ],
  exports: [WorkspaceMigrationRunnerService],
  providers: [WorkspaceMigrationRunnerService],
})
export class WorkspaceMigrationRunnerModule {}
