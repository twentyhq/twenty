import { Module } from '@nestjs/common';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav.provider';
import { CalDavCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-get-events.service';

@Module({
  imports: [TwentyConfigModule],
  providers: [CalDavClientProvider, CalDavCalendarGetEventsService],
  exports: [CalDavCalendarGetEventsService],
})
export class CalDavDriverModule {}
