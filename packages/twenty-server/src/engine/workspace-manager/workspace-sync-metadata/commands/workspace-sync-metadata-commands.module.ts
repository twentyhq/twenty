import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { SyncWorkspaceLoggerModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/services/sync-workspace-logger.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

import { SyncWorkspaceMetadataCommand } from './sync-workspace-metadata.command';

@Module({
  imports: [
    WorkspaceSyncMetadataModule,
    WorkspaceModule,
    DataSourceModule,
    WorkspaceDataSourceModule,
    FeatureFlagModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
    SyncWorkspaceLoggerModule,
    ApplicationModule,
  ],
  providers: [SyncWorkspaceMetadataCommand],
  exports: [SyncWorkspaceMetadataCommand],
})
export class WorkspaceSyncMetadataCommandsModule {}
