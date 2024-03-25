import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';
import { WorkspaceHealthModule } from 'src/engine/workspace-manager/workspace-health/workspace-health.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { AddStandardIdCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/add-standard-id.command';

import { SyncWorkspaceMetadataCommand } from './sync-workspace-metadata.command';

import { SyncWorkspaceLoggerService } from './services/sync-workspace-logger.service';

@Module({
  imports: [
    WorkspaceSyncMetadataModule,
    WorkspaceHealthModule,
    WorkspaceModule,
    DataSourceModule,
  ],
  providers: [
    SyncWorkspaceMetadataCommand,
    AddStandardIdCommand,
    SyncWorkspaceLoggerService,
  ],
})
export class WorkspaceSyncMetadataCommandsModule {}
