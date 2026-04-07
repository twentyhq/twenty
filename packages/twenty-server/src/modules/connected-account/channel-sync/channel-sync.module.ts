import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ChannelSyncResolver } from 'src/modules/connected-account/channel-sync/channel-sync.resolver';
import { ChannelSyncService } from 'src/modules/connected-account/channel-sync/services/channel-sync.service';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarChannelEntity, MessageChannelEntity]),
    PermissionsModule,
    WorkspaceDataSourceModule,
    MessagingCommonModule,
  ],
  providers: [ChannelSyncResolver, ChannelSyncService],
  exports: [ChannelSyncService],
})
export class ChannelSyncModule {}
