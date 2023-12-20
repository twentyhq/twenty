import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { WorkspaceSyncMetadataModule } from 'src/workspace/workspace-sync-metadata/workspace-sync-metadata.module';

import { SyncWorkspaceMetadataCommand } from './sync-workspace-metadata.command';

@Module({
  imports: [WorkspaceSyncMetadataModule, DataSourceModule],
  providers: [SyncWorkspaceMetadataCommand],
})
export class WorkspaceSyncMetadataCommandsModule {}
