import { Module } from '@nestjs/common';

import { HostnameGuardModule } from 'src/engine/core-modules/hostname-guard/hostname-guard.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav.provider';
import { CalDavGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-get-events.service';

@Module({
  imports: [HostnameGuardModule, TwentyConfigModule],
  providers: [CalDavClientProvider, CalDavGetEventsService],
  exports: [CalDavGetEventsService],
})
export class CalDavDriverModule {}
