import { Module } from '@nestjs/common';

import { WorkspaceManagerModule } from 'src/workspace/workspace-manager/workspace-manager.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';

import { SyncWorkspaceMetadataCommand } from './sync-workspace-metadata.command';

@Module({
  imports: [WorkspaceManagerModule, DataSourceModule],
  providers: [SyncWorkspaceMetadataCommand],
})
export class WorkspaceManagerCommandsModule {}
