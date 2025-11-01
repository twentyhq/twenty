import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ChannelSyncResolver } from 'src/modules/connected-account/channel-sync/channel-sync.resolver';
import { ChannelSyncService } from 'src/modules/connected-account/channel-sync/services/channel-sync.service';

@Module({
  imports: [PermissionsModule, WorkspaceDataSourceModule],
  providers: [ChannelSyncResolver, ChannelSyncService],
  exports: [ChannelSyncService],
})
export class ChannelSyncModule {}
