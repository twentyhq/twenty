import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';
import { WorkspaceHealthModule } from 'src/engine/workspace-manager/workspace-health/workspace-health.module';

import { WorkspaceManagerService } from './workspace-manager.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    WorkspaceMigrationModule,
    ObjectMetadataModule,
    DataSourceModule,
    WorkspaceSyncMetadataModule,
    WorkspaceHealthModule,
  ],
  exports: [WorkspaceManagerService],
  providers: [WorkspaceManagerService],
})
export class WorkspaceManagerModule {}
