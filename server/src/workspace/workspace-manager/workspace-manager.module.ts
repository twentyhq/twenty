import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { WorkspaceMigrationModule } from 'src/metadata/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { WorkspaceSyncMetadataModule } from 'src/workspace/workspace-sync-metadata/worksapce-sync-metadata.module';

import { WorkspaceManagerService } from './workspace-manager.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    ObjectMetadataModule,
    DataSourceModule,
    WorkspaceSyncMetadataModule,
  ],
  exports: [WorkspaceManagerService],
  providers: [WorkspaceManagerService],
})
export class WorkspaceManagerModule {}
