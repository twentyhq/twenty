import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CalendarChannelMetadataService } from 'src/engine/metadata-modules/calendar-channel/calendar-channel-metadata.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ApplicationCalendarChannelsResolver } from 'src/engine/metadata-modules/calendar-channel/resolvers/application-calendar-channels.resolver';
import { CalendarChannelResolver } from 'src/engine/metadata-modules/calendar-channel/resolvers/calendar-channel.resolver';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { CalendarCommonModule } from 'src/modules/calendar/common/calendar-common.module';
import { ChannelVisibilityModule } from 'src/engine/permissions/channel-visibility/channel-visibility.module';

@Module({
  imports: [
    ChannelVisibilityModule,
    TypeOrmModule.forFeature([CalendarChannelEntity]),
    ConnectedAccountMetadataModule,
    CalendarCommonModule,
  ],
  providers: [
    CalendarChannelMetadataService,
    CalendarChannelResolver,
    ApplicationCalendarChannelsResolver,
  ],
})
export class CalendarChannelMetadataModule {}
