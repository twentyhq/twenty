import { Module } from '@nestjs/common';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { CalDavClientService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-client.service';
import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';
import { CalDavGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-get-events.service';

@Module({
  imports: [SecureHttpClientModule, TwentyConfigModule],
  providers: [
    CalDavClientService,
    CalDavFetchEventsService,
    CalDavGetEventsService,
  ],
  exports: [
    CalDavClientService,
    CalDavFetchEventsService,
    CalDavGetEventsService,
  ],
})
export class CalDavDriverModule {}
