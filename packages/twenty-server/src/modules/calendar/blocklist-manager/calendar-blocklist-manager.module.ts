import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { BlocklistItemDeleteCalendarEventsJob } from 'src/modules/calendar/blocklist-manager/jobs/blocklist-item-delete-calendar-events.job';
import { BlocklistReimportCalendarEventsJob } from 'src/modules/calendar/blocklist-manager/jobs/blocklist-reimport-calendar-events.job';
import { CalendarBlocklistListener } from 'src/modules/calendar/blocklist-manager/listeners/calendar-blocklist.listener';
import { CalendarEventCleanerModule } from 'src/modules/calendar/calendar-event-cleaner/calendar-event-cleaner.module';
import { CalendarCommonModule } from 'src/modules/calendar/common/calendar-common.module';

@Module({
  imports: [
    CalendarEventCleanerModule,
    CalendarCommonModule,
    TypeOrmModule.forFeature([CalendarChannelEntity, UserWorkspaceEntity]),
  ],
  providers: [
    CalendarBlocklistListener,
    BlocklistItemDeleteCalendarEventsJob,
    BlocklistReimportCalendarEventsJob,
  ],
  exports: [],
})
export class CalendarBlocklistManagerModule {}
