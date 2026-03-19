import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/message-channel-data-access.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageChannelEntity]),
    FeatureFlagModule,
  ],
  providers: [MessageChannelDataAccessService],
  exports: [MessageChannelDataAccessService],
})
export class MessageChannelDataAccessModule {}
