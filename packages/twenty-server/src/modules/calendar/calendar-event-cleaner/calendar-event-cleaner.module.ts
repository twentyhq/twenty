import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { CalendarChannelDeletionCleanupJob } from 'src/modules/calendar/calendar-event-cleaner/jobs/calendar-channel-deletion-cleanup.job';
import { DeleteConnectedAccountAssociatedCalendarDataJob } from 'src/modules/calendar/calendar-event-cleaner/jobs/delete-connected-account-associated-calendar-data.job';

import { CalendarEventCleanerCalendarChannelListener } from 'src/modules/calendar/calendar-event-cleaner/listeners/calendar-event-cleaner-calendar-channel.listener';
import { CalendarEventCleanerConnectedAccountListener } from 'src/modules/calendar/calendar-event-cleaner/listeners/calendar-event-cleaner-connected-account.listener';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';

@Module({
  imports: [FeatureFlagModule],
  providers: [
    CalendarEventCleanerService,
    CalendarChannelDeletionCleanupJob,
    DeleteConnectedAccountAssociatedCalendarDataJob,
    CalendarEventCleanerCalendarChannelListener,
    CalendarEventCleanerConnectedAccountListener,
  ],
  exports: [CalendarEventCleanerService],
})
export class CalendarEventCleanerModule {}
