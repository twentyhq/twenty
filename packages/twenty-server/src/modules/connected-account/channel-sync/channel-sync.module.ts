import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ChannelSyncResolver } from 'src/modules/connected-account/channel-sync/channel-sync.resolver';
import { ChannelSyncService } from 'src/modules/connected-account/channel-sync/services/channel-sync.service';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarChannelEntity, MessageChannelEntity]),
    ConnectedAccountMetadataModule,
    PermissionsModule,
    MessagingCommonModule,
  ],
  providers: [ChannelSyncResolver, ChannelSyncService],
})
export class ChannelSyncModule {}
