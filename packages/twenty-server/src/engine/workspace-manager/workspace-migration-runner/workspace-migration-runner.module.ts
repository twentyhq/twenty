import { Module } from '@nestjs/common';

import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceMigrationEnumService } from 'src/engine/workspace-manager/workspace-migration-runner/services/workspace-migration-enum.service';

import { WorkspaceMigrationRunnerService } from './workspace-migration-runner.service';

import { WorkspaceMigrationTypeService } from './services/workspace-migration-type.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    WorkspaceMigrationModule,
    WorkspaceCacheVersionModule,
  ],
  providers: [
    WorkspaceMigrationRunnerService,
    WorkspaceMigrationEnumService,
    WorkspaceMigrationTypeService,
  ],
  exports: [WorkspaceMigrationRunnerService],
})
export class WorkspaceMigrationRunnerModule {}
