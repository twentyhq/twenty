import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceHealthModule } from 'src/engine/workspace-manager/workspace-health/workspace-health.module';
import { SyncWorkspaceLoggerModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/services/sync-workspace-logger.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

import { FixCompositeFieldColumnsCommand } from './fix-composite-field-columns.command';
import { SyncWorkspaceMetadataCommand } from './sync-workspace-metadata.command';

@Module({
  imports: [
    WorkspaceSyncMetadataModule,
    WorkspaceHealthModule,
    WorkspaceModule,
    DataSourceModule,
    WorkspaceDataSourceModule,
    FeatureFlagModule,
    TypeOrmModule.forFeature([Workspace, ObjectMetadataEntity, FieldMetadataEntity]),
    SyncWorkspaceLoggerModule,
  ],
  providers: [SyncWorkspaceMetadataCommand, FixCompositeFieldColumnsCommand],
  exports: [SyncWorkspaceMetadataCommand, FixCompositeFieldColumnsCommand],
})
export class WorkspaceSyncMetadataCommandsModule {}
