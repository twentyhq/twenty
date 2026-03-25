import { Module } from '@nestjs/common';

import { DeleteConnectedAccountAssociatedCalendarDataJob } from 'src/modules/calendar/calendar-event-cleaner/jobs/delete-connected-account-associated-calendar-data.job';
import { CalendarEventCleanerConnectedAccountListener } from 'src/modules/calendar/calendar-event-cleaner/listeners/calendar-event-cleaner-connected-account.listener';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';

@Module({
  imports: [],
  providers: [
    CalendarEventCleanerService,
    DeleteConnectedAccountAssociatedCalendarDataJob,
    CalendarEventCleanerConnectedAccountListener,
  ],
  exports: [CalendarEventCleanerService],
})
export class CalendarEventCleanerModule {}
