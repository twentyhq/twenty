import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ConnectedAccountDataAccessModule } from 'src/engine/metadata-modules/connected-account/data-access/connected-account-data-access.module';
import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/data-access/services/message-channel-data-access.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderDataAccessModule } from 'src/engine/metadata-modules/message-folder/data-access/message-folder-data-access.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageChannelEntity]),
    FeatureFlagModule,
    ConnectedAccountDataAccessModule,
    MessageFolderDataAccessModule,
  ],
  providers: [MessageChannelDataAccessService],
  exports: [MessageChannelDataAccessService],
})
export class MessageChannelDataAccessModule {}
