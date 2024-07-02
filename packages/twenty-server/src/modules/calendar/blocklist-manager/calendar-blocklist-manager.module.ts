import { Module } from '@nestjs/common';

import { BlocklistItemDeleteCalendarEventsJob } from 'src/modules/calendar/blocklist-manager/jobs/blocklist-item-delete-calendar-events.job';
import { BlocklistReimportCalendarEventsJob } from 'src/modules/calendar/blocklist-manager/jobs/blocklist-reimport-calendar-events.job';
import { CalendarBlocklistListener } from 'src/modules/calendar/blocklist-manager/listeners/calendar-blocklist.listener';
import { CalendarEventCleanerModule } from 'src/modules/calendar/calendar-event-cleaner/calendar-event-cleaner.module';
import { CalendarEventImportManagerModule } from 'src/modules/calendar/calendar-event-import-manager/calendar-event-import-manager.module';

@Module({
  imports: [CalendarEventCleanerModule, CalendarEventImportManagerModule],
  providers: [
    CalendarBlocklistListener,
    BlocklistItemDeleteCalendarEventsJob,
    BlocklistReimportCalendarEventsJob,
  ],
  exports: [],
})
export class CalendarBlocklistManagerModule {}
