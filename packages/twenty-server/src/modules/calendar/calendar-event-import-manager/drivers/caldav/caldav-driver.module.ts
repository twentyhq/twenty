import { Module } from '@nestjs/common';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav.provider';
import { CalDavGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-get-events.service';

@Module({
  imports: [SecureHttpClientModule, TwentyConfigModule],
  providers: [CalDavClientProvider, CalDavGetEventsService],
  exports: [CalDavGetEventsService],
})
export class CalDavDriverModule {}
