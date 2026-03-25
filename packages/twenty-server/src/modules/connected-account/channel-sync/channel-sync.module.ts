import { Module } from '@nestjs/common';

import { CalendarChannelDataAccessModule } from 'src/engine/metadata-modules/calendar-channel/data-access/calendar-channel-data-access.module';
import { MessageChannelDataAccessModule } from 'src/engine/metadata-modules/message-channel/data-access/message-channel-data-access.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ChannelSyncResolver } from 'src/modules/connected-account/channel-sync/channel-sync.resolver';
import { ChannelSyncService } from 'src/modules/connected-account/channel-sync/services/channel-sync.service';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';

@Module({
  imports: [
    CalendarChannelDataAccessModule,
    MessageChannelDataAccessModule,
    PermissionsModule,
    WorkspaceDataSourceModule,
    MessagingCommonModule,
  ],
  providers: [ChannelSyncResolver, ChannelSyncService],
  exports: [ChannelSyncService],
})
export class ChannelSyncModule {}
