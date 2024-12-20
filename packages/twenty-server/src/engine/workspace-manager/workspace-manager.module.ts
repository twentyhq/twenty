import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { SeederModule } from 'src/engine/seeder/seeder.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceHealthModule } from 'src/engine/workspace-manager/workspace-health/workspace-health.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

import { WorkspaceManagerService } from './workspace-manager.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    WorkspaceMigrationModule,
    ObjectMetadataModule,
    SeederModule,
    DataSourceModule,
    WorkspaceSyncMetadataModule,
    WorkspaceHealthModule,
    FeatureFlagModule,
  ],
  exports: [WorkspaceManagerService],
  providers: [WorkspaceManagerService],
})
export class WorkspaceManagerModule {}
