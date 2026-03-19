import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/data-access/services/message-channel-data-access.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageChannelEntity]),
    FeatureFlagModule,
  ],
  providers: [MessageChannelDataAccessService],
  exports: [MessageChannelDataAccessService],
})
export class MessageChannelDataAccessModule {}
