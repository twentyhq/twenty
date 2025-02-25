import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceHealthModule } from 'src/engine/workspace-manager/workspace-health/workspace-health.module';
import { ConvertRecordPositionsToIntegers } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/convert-record-positions-to-integers.command';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

import { SyncWorkspaceMetadataCommand } from './sync-workspace-metadata.command';

import { SyncWorkspaceLoggerService } from './services/sync-workspace-logger.service';

@Module({
  imports: [
    WorkspaceSyncMetadataModule,
    WorkspaceHealthModule,
    WorkspaceModule,
    DataSourceModule,
    WorkspaceDataSourceModule,
    FeatureFlagModule,
    TypeOrmModule.forFeature([Workspace], 'core'),
  ],
  providers: [
    SyncWorkspaceMetadataCommand,
    ConvertRecordPositionsToIntegers,
    SyncWorkspaceLoggerService,
  ],
  exports: [SyncWorkspaceMetadataCommand],
})
export class WorkspaceSyncMetadataCommandsModule {}
