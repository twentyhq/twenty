import { Module } from '@nestjs/common';

import { BlocklistItemDeleteCalendarEventsJob } from 'src/modules/calendar/blocklist-manager/jobs/blocklist-item-delete-calendar-events.job';
import { BlocklistReimportCalendarEventsJob } from 'src/modules/calendar/blocklist-manager/jobs/blocklist-reimport-calendar-events.job';
import { CalendarBlocklistListener } from 'src/modules/calendar/blocklist-manager/listeners/calendar-blocklist.listener';

@Module({
  imports: [],
  providers: [
    CalendarBlocklistListener,
    {
      provide: BlocklistItemDeleteCalendarEventsJob.name,
      useClass: BlocklistItemDeleteCalendarEventsJob,
    },
    {
      provide: BlocklistReimportCalendarEventsJob.name,
      useClass: BlocklistReimportCalendarEventsJob,
    },
  ],
  exports: [],
})
export class CalendarBlocklistManagerModule {}
