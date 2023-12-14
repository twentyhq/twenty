import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { WorkspaceSyncMetadataModule } from 'src/workspace/workspace-sync-metadata/worksapce-sync-metadata.module';

import { SyncWorkspaceMetadataCommand } from './sync-workspace-metadata.command';
import { TestWorkspaceMetadataCommand } from './test.command';

@Module({
  imports: [WorkspaceSyncMetadataModule, DataSourceModule],
  providers: [SyncWorkspaceMetadataCommand, TestWorkspaceMetadataCommand],
})
export class WorkspaceSyncMetadataCommandsModule {}
