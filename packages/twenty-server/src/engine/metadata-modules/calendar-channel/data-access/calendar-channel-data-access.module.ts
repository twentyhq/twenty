import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { CalendarChannelDataAccessService } from 'src/engine/metadata-modules/calendar-channel/data-access/services/calendar-channel-data-access.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarChannelEntity]),
    FeatureFlagModule,
  ],
  providers: [CalendarChannelDataAccessService],
  exports: [CalendarChannelDataAccessService],
})
export class CalendarChannelDataAccessModule {}
