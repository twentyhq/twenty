import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { WorkspaceSyncMetadataModule } from 'src/workspace/workspace-sync-metadata/workspace-sync-metadata.module';
import { WorkspaceHealthModule } from 'src/workspace/workspace-health/workspace-health.module';
import { WorkspaceModule } from 'src/core/workspace/workspace.module';
import { AddStandardIdCommand } from 'src/workspace/workspace-sync-metadata/commands/add-standard-id.command';

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
