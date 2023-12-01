import { Module } from '@nestjs/common';

import { WorkspaceMigrationModule } from 'src/metadata/workspace-migration/workspace-migration.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { WorkspaceCacheVersionModule } from 'src/metadata/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceMigrationEnumService } from 'src/workspace/workspace-migration-runner/services/workspace-migration-enum.service';

import { WorkspaceMigrationRunnerService } from './workspace-migration-runner.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    WorkspaceMigrationModule,
    WorkspaceCacheVersionModule,
  ],
  providers: [WorkspaceMigrationRunnerService, WorkspaceMigrationEnumService],
  exports: [WorkspaceMigrationRunnerService],
})
export class WorkspaceMigrationRunnerModule {}
